"""Validate built XML independently of the generator; optionally check local HTTP."""
import argparse
import concurrent.futures
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
ORIGIN = 'https://kalenteri365.fi'
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
IMAGE = 'http://www.google.com/schemas/sitemap-image/1.1'
LIMIT = 50 * 1024 * 1024
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--http', action='store_true')
parser.add_argument('--base-url', default='http://127.0.0.1:4186')
args = parser.parse_args()
if urllib.parse.urlparse(args.base_url).hostname not in {'localhost', '127.0.0.1', '::1'}:
    raise SystemExit('HTTP verification must use a local preview.')

failures = []
checks = 0
def check(passed, route, name):
    global checks
    checks += 1
    if not passed:
        failures.append({'route': route, 'check': name})

def xml_document(name, element):
    raw = (OUT / name).read_bytes()
    text = raw.decode('utf-8')
    check(0 < len(raw) <= LIMIT, name, 'Uncompressed size within 50 MB')
    check('encoding="UTF-8"' in text[:100], name, 'Declared UTF-8')
    check('<!DOCTYPE' not in text and '<!ENTITY' not in text, name, 'No external XML entities')
    tree = ET.fromstring(text)
    check(tree.tag == '{' + NS + '}' + element, name, 'Correct root and namespace')
    check(len(tree) <= 50000, name, 'At most 50,000 entries')
    return tree

def location(element, tag, name, page=False):
    nodes = element.findall(tag)
    check(len(nodes) == 1, name, 'Exactly one loc')
    url = nodes[0].text or '' if nodes else ''
    check(url == url.strip(), name, 'No URL whitespace')
    parsed = urllib.parse.urlparse(url)
    check(parsed.scheme == 'https' and parsed.netloc == 'kalenteri365.fi', name, 'Canonical HTTPS origin')
    check(not parsed.fragment and len(url) < 2048, name, 'No fragment and URL length within limit')
    if page:
        check(not parsed.query and parsed.path.endswith('/'), name, 'Clean canonical page URL')
    return url

records = json.loads((ROOT / 'reports/pages.json').read_text())
expected = {ORIGIN + p['path']: p for p in records if p['indexable']}
main = xml_document('sitemap.xml', 'urlset')
image_map = xml_document('sitemap-images.xml', 'urlset')
index = xml_document('sitemap-index.xml', 'sitemapindex')
urls = [location(e, '{'+NS+'}loc', 'sitemap.xml', page=True) for e in main]
check(len(urls) == len(set(urls)), 'sitemap.xml', 'No duplicate pages')
check(set(urls) == set(expected), 'sitemap.xml', 'Exact complete indexable page inventory')
for url in urls:
    route = urllib.parse.urlparse(url).path
    file = OUT / route.lstrip('/') / 'index.html'
    check(file.is_file(), route, 'Page exists')
    if not file.is_file():
        continue
    html = file.read_text()
    check(bool(re.search(r'<link\b[^>]*rel="canonical"[^>]*href="' + re.escape(url) + r'"', html)), route, 'Canonical matches loc')
    for tag in re.findall(r'<meta\b[^>]*>', html):
        if re.search(r'name="(?:robots|googlebot|bingbot)"', tag, re.I):
            value = re.search(r'content="([^"]*)"', tag)
            check(not value or not re.search(r'\b(?:noindex|none)\b', value[1], re.I), route, 'Not marked noindex')

image_pages, image_urls = [], []
for element in image_map:
    url = location(element, '{'+NS+'}loc', 'sitemap-images.xml', page=True)
    image_pages.append(url)
    images = element.findall('{'+IMAGE+'}image')
    check(1 <= len(images) <= 1000, url, 'Between 1 and 1,000 images per page')
    local_images = [location(e, '{'+IMAGE+'}loc', url) for e in images]
    check(len(local_images) == len(set(local_images)), url, 'No repeated images within a page')
    if url in expected:
        social = expected[url].get('social', {}).get('src')
        check(bool(social) and ORIGIN + social in local_images, url, 'Current page-specific OG image included')
    image_urls.extend(local_images)
check(len(image_pages) == len(set(image_pages)), 'sitemap-images.xml', 'No duplicate page entries')
check(set(image_pages) == set(expected), 'sitemap-images.xml', 'All indexable pages have image entries')
for url in set(image_urls):
    file = (OUT / urllib.parse.unquote(urllib.parse.urlparse(url).path).lstrip('/')).resolve()
    check(file.is_relative_to(OUT.resolve()) and file.is_file() and file.stat().st_size > 0, url, 'Nonempty local image exists')

children = [location(e, '{'+NS+'}loc', 'sitemap-index.xml') for e in index]
check(len(children) == 2 and set(children) == {ORIGIN+'/sitemap.xml', ORIGIN+'/sitemap-images.xml'}, 'sitemap-index.xml', 'Both sitemaps discoverable once')
robots = (OUT / 'robots.txt').read_text()
discoverable = re.findall(r'^Sitemap:\s*(\S+)\s*$', robots, re.M | re.I)
check(discoverable == [ORIGIN+'/sitemap-index.xml'], 'robots.txt', 'Single sitemap index discovery address')
check(not re.search(r'^Disallow:\s*/\s*$', robots, re.M | re.I), 'robots.txt', 'Crawling is allowed')

class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None

http_results = []
if args.http:
    def fetch(route):
        try:
            with urllib.request.build_opener(NoRedirects()).open(args.base_url.rstrip('/') + route, timeout=20) as res:
                return {'route': route, 'status': res.status, 'type': res.headers.get_content_type(), 'data': res.read() if route.endswith(('.xml','.txt')) else None}
        except Exception as error:
            return {'route': route, 'error': str(error)}
    routes = ['/'+name for name in ['sitemap.xml','sitemap-images.xml','sitemap-index.xml','robots.txt']]
    routes += [urllib.parse.urlparse(u).path for u in urls]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for result in pool.map(fetch, routes):
            route = result['route']
            check(result.get('status') == 200, route, 'HTTP 200 without redirects')
            want_type = 'application/xml' if route.endswith('.xml') else 'text/plain' if route.endswith('.txt') else 'text/html'
            check(result.get('type') == want_type, route, 'Correct response content type')
            if result.get('data') is not None:
                check(result.pop('data') == (OUT / route.lstrip('/')).read_bytes(), route, 'Served bytes match current generated file')
            http_results.append(result)

report = {'pages': len(urls), 'imagePages': len(image_pages), 'imageEntries': len(image_urls),
          'uniqueImages': len(set(image_urls)), 'indexChildren': children, 'checks': checks,
          'failures': failures, 'http': http_results}
(ROOT / 'reports/sitemap-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k:v for k,v in report.items() if k != 'http'}, ensure_ascii=False, indent=2))
raise SystemExit(bool(failures))
