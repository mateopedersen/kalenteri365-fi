"""Inspect rendered explanations, not a target SEO word count.

Search and sitemap pages are navigation utilities. Their usefulness comes from
results and links, so they are recorded separately instead of padded with prose.
"""
import importlib.util
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('editorial_audit', ROOT/'scripts/audit-editorial.py')
editorial = importlib.util.module_from_spec(spec)
spec.loader.exec_module(editorial)
UTILITIES = {'/haku/': 'Search results', '/sivukartta/': 'Navigation directory'}


def main():
    records = json.loads((ROOT/'reports/pages.json').read_text())
    failures, rows, markers = [], [], Counter()
    for record in records:
        route = record['path']
        html = (ROOT/'dist'/route.lstrip('/')/'index.html').read_text()
        page = editorial.Page(route, html)
        paragraphs = [' '.join(p.split()) for p in page.paragraphs if p.strip()]
        reason = UTILITIES.get(route)
        if not reason and not paragraphs:
            failures.append([route, 'No explanatory paragraph in rendered main content'])
        for text in paragraphs:
            if re.search(r'\b(?:undefined|NaN|lorem ipsum)\b', text, re.I):
                failures.append([route, 'Unresolved text', text])
        examples = re.findall(r'data-page-explanation="([^"]+)"', html)
        markers.update(examples)
        if len(examples) != len(set(examples)):
            failures.append([route, 'Repeated explanation block'])
        rows.append({'path': route, 'family': record['group'],
                     'paragraphs': len(paragraphs),
                     'prose_words': len(' '.join(paragraphs).split()),
                     'explanation_blocks': examples,
                     'utility_reason': reason})
    result = {'pages': len(records), 'failures': failures,
              'topic_examples': sum(n for k, n in markers.items() if not k.startswith('crop-')),
              'crop_explanations': sum(n for k, n in markers.items() if k.startswith('crop-')),
              'utilities': UTILITIES, 'pages_detail': rows}
    (ROOT/'reports/content-coverage.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'pages_detail'}, ensure_ascii=False))
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
