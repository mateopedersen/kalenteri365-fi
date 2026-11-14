import fs from 'node:fs/promises';
import path from 'node:path';

export const ORIGIN = 'https://kalenteri365.fi';
export const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
export const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1';
const MAX_URLS = 50_000, MAX_BYTES = 50 * 1024 * 1024;
export const xmlEscape = value => String(value).replace(/[&<>"']/g, c =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[c]));
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
  const named = {'&amp;':'&', '&quot;':'"', '&apos;':"'", '&lt;':'<', '&gt;':'>'};
  return named[entity] ?? String.fromCodePoint(entity[2].toLowerCase() === 'x'
    ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10));
});
const attr = (tag, name) => {
  const match = tag.match(new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i'));
  return match ? decode(match[1] ?? match[2]) : null;
};

export function pageURL(route) {
  if (typeof route !== 'string' || !route.startsWith('/') || !route.endsWith('/') ||
      /[?#\\\s]/u.test(route) || /\/\//.test(route) || /%(?:2f|5c)/i.test(route)) {
    throw Error('Invalid sitemap route: ' + route);
  }
  const url = new URL(route, ORIGIN);
  if (url.origin !== ORIGIN || url.pathname !== route || url.href.length >= 2048 ||
      decodeURIComponent(route).split('/').some(p => p === '.' || p === '..')) {
    throw Error('Non-canonical sitemap route: ' + route);
  }
  return url.href;
}

function documentXML(body, root, namespace = '') {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="${SITEMAP_NS}"${namespace}>\n${body}\n</${root}>\n`;
  if (Buffer.byteLength(xml) > MAX_BYTES) throw Error('Sitemap exceeds 50 MB; split it before publication.');
  return xml;
}

export function pageSitemap(pages) {
  const urls = new Set();
  for (const page of pages) {
    if (page.indexable !== true) continue;
    const url = pageURL(page.path);
    if (urls.has(url)) throw Error('Duplicate sitemap route: ' + page.path);
    urls.add(url);
  }
  if (!urls.size || urls.size > MAX_URLS) throw Error('Sitemap must contain 1–50,000 URLs.');
  const sorted = [...urls].sort();
  return {urls: sorted, xml: documentXML(sorted.map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n'), 'urlset')};
}

function verifyPage(html, url) {
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].filter(m => attr(m[0], 'rel') === 'canonical');
  if (canonical.length !== 1 || attr(canonical[0][0], 'href') !== url) throw Error('Sitemap canonical mismatch: ' + url);
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (['robots','googlebot','bingbot'].includes((attr(match[0], 'name') || '').toLowerCase()) &&
        /(?:^|[,\s])(?:noindex|none)(?:$|[,\s])/i.test(attr(match[0], 'content') || '')) {
      throw Error('Noindex page included in sitemap: ' + url);
    }
  }
}

// Keep full-resolution local originals instead of responsive thumbnails.
export function discoverImages(html, page, photos = [], downloadVersion = '') {
  const images = new Set(page.social?.src ? [page.social.src] : []);
  const originals = new Map();
  for (const photo of photos) for (const src of [photo.src, photo.src.replace('.webp','-320.webp'), photo.src.replace('.webp','-640.webp')]) originals.set(src, photo.src);
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = attr(match[0], 'src')?.split('?')[0], alt = attr(match[0], 'alt');
    if (!src || !alt?.trim() || !/^\/(?:assets\/(?:photos|seasons)\/|lataukset\/)/.test(src)) continue;
    const original = originals.get(src) || (src.startsWith('/assets/seasons/')
      ? src.replace(/-(360|720)\.(webp|avif)$/, '-1200.webp') : src.replace('-preview.webp', '.webp'));
    images.add(original.startsWith('/lataukset/') && downloadVersion
      ? original + '?v=' + encodeURIComponent(downloadVersion) : original);
  }
  // These photographs are selectable in the homepage's client-rendered city card.
  if (page.path === '/') for (const photo of photos) {
    if (['city','city-night','municipality'].includes(photo.kind)) images.add(photo.src);
  }
  return [...images].sort();
}

export async function writeSitemaps({out, pages, photos = [], downloadVersion = ''}) {
  const sitemap = pageSitemap(pages), byURL = new Map(pages.filter(p => p.indexable === true).map(p => [pageURL(p.path), p]));
  const imageEntries = [], checkedImages = new Set();
  let imageCount = 0;
  for (const url of sitemap.urls) {
    const page = byURL.get(url), html = await fs.readFile(path.join(out, page.path, 'index.html'), 'utf8');
    verifyPage(html, url);
    const sources = discoverImages(html, page, photos, downloadVersion), imageURLs = new Set();
    for (const src of sources) {
      const image = new URL(src, ORIGIN);
      if (image.origin !== ORIGIN || image.hash || !src.startsWith('/') || src.startsWith('//') ||
          decodeURIComponent(src.split('?')[0]).split('/').some(p => p === '.' || p === '..') ||
          /%(?:2f|5c)/i.test(src.split('?')[0]) || image.href.length >= 2048 ||
          /[\u0000-\u0020\\]/.test(src)) throw Error('Invalid sitemap image: ' + src);
      if (!checkedImages.has(image.pathname)) {
        const file = path.resolve(out, '.' + decodeURIComponent(image.pathname));
        if (!file.startsWith(path.resolve(out) + path.sep) || !(await fs.stat(file)).isFile()) throw Error('Missing sitemap image: ' + src);
        checkedImages.add(image.pathname);
      }
      imageURLs.add(image.href);
    }
    const images = [...imageURLs].sort();
    if (images.length > 1000) throw Error('Image sitemap exceeds 1,000 images on ' + page.path);
    if (images.length) imageEntries.push(`  <url><loc>${xmlEscape(url)}</loc>\n${images.map(src => `    <image:image><image:loc>${xmlEscape(src)}</image:loc></image:image>`).join('\n')}\n  </url>`);
    imageCount += images.length;
  }
  const imageXML = documentXML(imageEntries.join('\n'), 'urlset', ` xmlns:image="${IMAGE_NS}"`);
  const indexXML = documentXML(['sitemap.xml','sitemap-images.xml'].map(name =>
    `  <sitemap><loc>${ORIGIN}/${name}</loc></sitemap>`).join('\n'), 'sitemapindex');
  // Optional lastmod is omitted: a rebuild date is not a verified content-change date.
  await fs.writeFile(path.join(out, 'sitemap.xml'), sitemap.xml);
  await fs.writeFile(path.join(out, 'sitemap-images.xml'), imageXML);
  await fs.writeFile(path.join(out, 'sitemap-index.xml'), indexXML);
  await fs.writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap-index.xml\n`);
  return {pages: sitemap.urls.length, imagePages: imageEntries.length, images: imageCount, uniqueImages: checkedImages.size};
}
