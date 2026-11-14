"""Check built route, landmark, fragment, sitemap and local HTTP integrity."""
import json,collections,urllib.parse,urllib.request,urllib.error,concurrent.futures,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'dist'; origin='https://kalenteri365.fi'
class Page(HTMLParser):
 def __init__(self,html):
  super().__init__(convert_charrefs=True);self.ids=[];self.refs=[];self.images=[];self.headings=[];self.feed(html)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='a' and a.get('href'):self.refs.append(a['href'])
  if tag=='img':self.images.append(a)
  if tag in ('h1','main'):self.headings.append(tag)
records=json.loads((ROOT/'reports/pages.json').read_text()); pages={p['path']:Page((OUT/p['path'].lstrip('/')/'index.html').read_text()) for p in records};issues=[];warnings=[]
for route,p in pages.items():
 dup=[key for key,n in collections.Counter(p.ids).items() if n>1]
 if dup:issues.append([route,'duplicate IDs',dup])
 if p.headings.count('main')!=1:issues.append([route,'main landmark count'])
 for a in p.images:
  if 'alt' not in a:issues.append([route,'missing alt',a.get('src')])
  if not a.get('width') or not a.get('height'):warnings.append([route,'image dimensions not reserved',a.get('src')])
 for href in p.refs:
  u=urllib.parse.urlparse(urllib.parse.urljoin(origin+route,href))
  if u.netloc!='kalenteri365.fi' or not u.fragment:continue
  dest=pages.get(urllib.parse.unquote(u.path));frag=urllib.parse.unquote(u.fragment)
  if dest and frag not in dest.ids:issues.append([route,'missing fragment',href])
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[e.text for e in ET.parse(OUT/'sitemap.xml').findall('.//s:loc',ns)];wanted={origin+p['path'] for p in records if p['indexable']}
if set(urls)!=wanted:issues.append(['sitemap','exact URL set differs',list(set(urls)^wanted)])
if len(urls)!=len(set(urls)):issues.append(['sitemap','duplicate URLs'])
image_tree=ET.parse(OUT/'sitemap-images.xml');image_urls=[e.text for e in image_tree.findall('.//{http://www.google.com/schemas/sitemap-image/1.1}loc')]
for u in image_urls:
 if not (OUT/urllib.parse.unquote(urllib.parse.urlparse(u).path).lstrip('/')).is_file():issues.append(['image sitemap','missing file',u])
def get(route):
 try:
  with urllib.request.urlopen('http://127.0.0.1:4186'+route,timeout=20) as res:
   if res.status!=200 or 'text/html' not in res.headers.get('content-type',''):return [route,'bad HTTP response',res.status]
 except Exception as e:return [route,'HTTP error',str(e)]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 issues.extend(i for i in pool.map(get,pages) if i)
try:urllib.request.urlopen('http://127.0.0.1:4186/nonexistent-seo-audit-page/',timeout=10);issues.append(['404','incorrect success response'])
except urllib.error.HTTPError as e:
 if e.code!=404:issues.append(['404','wrong status',e.code])
result={'pages':len(pages),'http_checked':len(pages)+1,'sitemap_urls':len(urls),'image_sitemap_entries':len(image_urls),'issues':issues,'warnings':warnings}
(ROOT/'reports/technical-crawl.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({**{k:v for k,v in result.items() if k not in ('issues','warnings')},'issue_count':len(issues),'warning_count':len(warnings),'issues_sample':issues[:15],'warnings_sample':warnings[:5]},ensure_ascii=False))

raise SystemExit(bool(issues))
