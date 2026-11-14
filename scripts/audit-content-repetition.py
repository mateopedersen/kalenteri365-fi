"""Inventory repeated built-page paragraphs and destinations. Counts include intentional table/navigation repetition; review context before editing."""
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter,defaultdict
import json,re
class Audit(HTMLParser):
 def __init__(self):
  super().__init__();self.main=False;self.stack=[];self.ps=[];self.links=[];self.p=None;self.a=None
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if t=='main':self.main=True
  if not self.main:return
  if t=='p':self.p=[]
  if t=='a':self.a=[d.get('href',''),[]]
 def handle_data(self,s):
  if self.p is not None:self.p.append(s)
  if self.a is not None:self.a[1].append(s)
 def handle_endtag(self,t):
  if t=='p' and self.p is not None:
   self.ps.append(' '.join(''.join(self.p).split()));self.p=None
  if t=='a' and self.a is not None:
   self.links.append((self.a[0],' '.join(''.join(self.a[1]).split())));self.a=None
  if t=='main':self.main=False
ROOT=Path(__file__).resolve().parents[1]
root=ROOT/'dist'; paragraphs=defaultdict(list);pages=[]
for f in root.rglob('*.html'):
 a=Audit();a.feed(f.read_text());path='/'+str(f.relative_to(root)).removesuffix('index.html');c=Counter(p for p in a.ps if len(p)>70)
 for p in c:paragraphs[p].append(path)
 links=Counter(h for h,s in a.links if h.startswith('/') and not h.startswith('/assets/') and not h.startswith('/lataukset/'))
 pages.append({'path':path,'duplicateParagraphs':[p for p,n in c.items() if n>1],'repeatedTargets':{h:n for h,n in links.items() if n>2}})
out={'pages':len(pages),'pagesWithExactRepeatedParagraphs':sum(bool(p['duplicateParagraphs']) for p in pages),'mostRepeatedParagraphs':[{'text':s,'count':len(v),'examples':v[:3]} for s,v in sorted(paragraphs.items(),key=lambda r:-len(r[1]))[:35]],'details':pages}
(ROOT/'reports/content-dedup-20261114'/((__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'current')+'.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in out.items() if k!='details'},ensure_ascii=False,indent=2));print('Most repeated destinations:',sorted(((p['path'],p['repeatedTargets']) for p in pages),key=lambda r:-sum(r[1].values()))[:6])
