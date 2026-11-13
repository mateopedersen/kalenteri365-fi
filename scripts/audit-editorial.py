"""Audit actual built main content; distinguish prose links from navigation/controls."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
ORIGIN = 'https://kalenteri365.fi'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Page(HTMLParser):
    def __init__(self, route, html):
        super().__init__(convert_charrefs=True)
        self.route, self.stack, self.ids, self.links, self.paragraphs, self.nested, self.all_hrefs = route, [], set(), [], [], [], []
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'): self.all_hrefs.append(attrs['href'])
        if attrs.get('id'): self.ids.add(attrs['id'])
        node = {'tag':tag, 'attrs':attrs, 'text':[]}
        if tag == 'a' and any(x['tag']=='main' for x in self.stack):
            if any(x['tag']=='a' for x in self.stack): self.nested.append(attrs.get('href'))
            node['anchor'] = {'href':attrs.get('href',''), 'label':node['text'], 'editorial':'data-editorial-link' in attrs,
                'prose':any(x['tag']=='p' for x in self.stack) and not any(x['tag'] in {'nav','form','figure'} or any(c in x['attrs'].get('class','').split() for c in ['related','related-topics','download-card','tool-card','blog-card','source-note']) for x in self.stack)}
            self.links.append(node['anchor'])
        if tag not in VOID: self.stack.append(node)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i]['tag']==tag:
                node=self.stack[i]
                if tag=='p' and any(x['tag']=='main' for x in self.stack[:i]) and not any(x['tag'] in {'nav','form','figure'} for x in self.stack[:i]):
                    self.paragraphs.append(''.join(node['text']).strip())
                self.stack=self.stack[:i]
                break
    def handle_data(self, text):
        for node in self.stack:
            if node['tag'] in {'p','a'}: node['text'].append(text)

def main():
    records=json.loads((ROOT/'reports/pages.json').read_text())
    pages={p['path']:Page(p['path'],(OUT/p['path'].lstrip('/')/'index.html').read_text()) for p in records}
    failures=[]; groups={}; details=[]; external=set(); checks=0; incoming=Counter()
    descriptions=Counter(p['description'] for p in records)
    for p in records:
        if not p['description'].strip():failures.append([p['path'],'missing description'])
        if descriptions[p['description']]>1:failures.append([p['path'],'duplicate description'])
    for route,p in pages.items():
        for href in p.all_hrefs:
            u=urlparse(urljoin(ORIGIN+route,href))
            if u.netloc=='kalenteri365.fi' and u.path!=route:incoming[unquote(u.path)]+=1
    for record in records:
        route=record['path'];p=pages[route]
        if p.nested: failures.append([route,'nested anchors',p.nested])
        n=Counter(); prose=[]
        for l in p.links:
            checks+=1
            href=l['href'];label=''.join(l['label']).strip()
            if not href: failures.append([route,'missing href']);continue
            u=urlparse(urljoin(ORIGIN+route,href))
            if u.scheme in {'http','https'} and u.netloc=='kalenteri365.fi':
                target=unquote(u.path);file=OUT/target.lstrip('/')
                if target.endswith('/'):file/='index.html'
                if not file.is_file():failures.append([route,'missing internal target',href])
                if target in pages:
                    if target!=route:incoming[target]+=1
                    if u.fragment and unquote(u.fragment) not in pages[target].ids:failures.append([route,'missing fragment',href])
                typ='internal'
            elif u.scheme in {'http','https'}:
                if not u.netloc:failures.append([route,'invalid external URL',href])
                typ='external';external.add(href)
            else:continue
            if l['prose']:n['prose_'+typ]+=1;prose.append({'href':href,'text':label,'type':typ,'added':l['editorial']})
            if l['editorial']:
                n['editorial_'+typ]+=1
                if not label:failures.append([route,'empty editorial anchor',href])
                if typ=='internal' and unquote(u.path)==route and not u.query and not u.fragment:failures.append([route,'editorial self link',href])
        if '/blogi/' in route and route!='/blogi/':
            for typ in ['internal','external']:
                if not n['editorial_'+typ]:failures.append([route,'missing contextual blog '+typ+' link'])
        group=groups.setdefault(record['group'],Counter());group.update(n);group['pages']+=1;group['pages_with_prose_links']+=bool(prose)
        details.append({'path':route,'paragraphs':len(p.paragraphs),'prose_words':len(' '.join(p.paragraphs).split()),'links':dict(n),'prose_links':prose})
    orphans=[r['path'] for r in records if r['path']!='/' and r['indexable'] and not incoming[r['path']]]
    if orphans:failures.append(['site','no incoming crawlable links',orphans])
    result={'pages':len(records),'checks':checks,'failures':failures,'orphans_without_incoming_links':orphans,'groups':{k:dict(v) for k,v in groups.items()},'external_urls':sorted(external),'pages_detail':details}
    (ROOT/'reports/editorial-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'pages':len(records),'checks':checks,'failures':len(failures),'groups':result['groups'],'issues':failures[:30]},ensure_ascii=False,indent=2))
    return bool(failures)

if __name__=='__main__':raise SystemExit(main())
