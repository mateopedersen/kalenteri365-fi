// Editorial repetition only. Keep navigation, downloads, form controls and
// source text intact; a second editorial link in prose adds no new destination.
// A source bibliography or a form button must not suppress the first prose link.
const decode = value => value.replaceAll('&amp;', '&');
export function contentDestinations(html) {
  return new Set(Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi), m => decode(m[1]).split('#')[0]));
}
export function deduplicateEditorialLinks(html, path) {
  const used = new Set();
  return html.replace(/<a\b([^>]*\bdata-editorial-link\b[^>]*)>([\s\S]*?)<\/a>/gi, (tag, attributes, text) => {
    const href = decode(attributes.match(/\bhref="([^"]+)"/)?.[1] || '');
    if (!href || href === path || used.has(href)) return text;
    used.add(href);
    return tag;
  });
}
