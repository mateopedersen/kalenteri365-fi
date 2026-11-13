import {brandedTitle} from '../src/metadata.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ORIGIN = 'https://kalenteri365.fi';
const MAX_BYTES = 500_000;
const SHA256 = /^[a-f0-9]{64}$/;
const rendererFiles = ['social.mjs', 'social-model.mjs', 'social-render.mjs', 'social-type.mjs', 'social-scenes.mjs'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export function decodeEntities(value = '') {
  const named = {amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0'};
  return String(value).replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, key) => {
    if (key[0] !== '#') return named[key.toLowerCase()] ?? entity;
    const hex = key[1].toLowerCase() === 'x';
    const number = Number.parseInt(key.slice(hex ? 2 : 1), hex ? 16 : 10);
    return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
      ? String.fromCodePoint(number) : '\ufffd';
  });
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4]);
  }
  return result;
}

export function parseHead(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1];
  if (head === undefined) return null;
  const meta = new Map();
  for (const match of head.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attributes(match[0]), key = (a.property || a.name || '').toLowerCase();
    if (key) meta.set(key, [...(meta.get(key) || []), a.content ?? '']);
  }
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0]));
  const json = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter(match => attributes(match[1]).type === 'application/ld+json').map(match => match[2]);
  return {meta, links, json, title: decodeEntities(head.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] || '')};
}

function findValues(value, key, output = []) {
  if (!value || typeof value !== 'object') return output;
  if (Object.hasOwn(value, key)) output.push(value[key]);
  for (const child of Object.values(value)) findValues(child, key, output);
  return output;
}

function findTypes(value, type, output = []) {
  if (!value || typeof value !== 'object') return output;
  if ([value['@type']].flat().includes(type)) output.push(value);
  for (const child of Object.values(value)) findTypes(child, type, output);
  return output;
}

function parseImageSitemap(xml) {
  const entries = new Map();
  for (const match of xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url\s*>/gi)) {
    const page = decodeEntities(match[1].match(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/i)?.[1]?.trim() || '');
    const images = [...match[1].matchAll(/<image:loc\b[^>]*>([\s\S]*?)<\/image:loc\s*>/gi)]
      .map(image => decodeEntities(image[1].trim()));
    entries.set(page, [...(entries.get(page) || []), ...images]);
  }
  return entries;
}

export async function auditSocial(root = ROOT) {
  const out = path.join(root, 'dist'), failures = [], pageResults = [], sourceResults = new Map(), assetResults = new Map();
  let checks = 0;
  const check = (pass, route, name, details) => {
    checks++;
    if (!pass) failures.push({route, check: name, ...(details === undefined ? {} : {details})});
    return Boolean(pass);
  };
  const read = async (file, route, name) => {
    try {return await fs.readFile(file);}
    catch (error) {check(false, route, name, {file: path.relative(root, file), error: error.code || error.message}); return null;}
  };
  const readJSON = async (file, name) => {
    const bytes = await read(file, null, name);
    if (!bytes) return null;
    try {return JSON.parse(bytes.toString('utf8'));}
    catch (error) {check(false, null, name + '-json', error.message); return null;}
  };

  const pages = await readJSON(path.join(root, 'reports/pages.json'), 'pages-inventory');
  const manifest = await readJSON(path.join(out, 'assets/social/manifest.json'), 'social-manifest');
  const photos = await readJSON(path.join(root, 'data/photo-credits.json'), 'photo-registry');
  const imageXml = await read(path.join(out, 'sitemap-images.xml'), null, 'image-sitemap');
  const robots = await read(path.join(out, 'robots.txt'), null, 'robots-txt');
  const expected = Array.isArray(pages) ? [...pages.filter(p => p.path !== '/404/'), {
    path: '/404/', title: 'Sivua ei löytynyt', description: 'Etsimääsi osoitetta ei löytynyt.', indexable: false, locale: 'fi',
  }] : [];
  const records = Array.isArray(manifest?.images) ? manifest.images : [];
  check(Array.isArray(pages) && pages.length > 0, null, 'pages-inventory-shape');
  check(Array.isArray(manifest?.images), null, 'manifest-images-array');
  check(Array.isArray(photos), null, 'photo-registry-shape');
  check(manifest?.pages === records.length, null, 'manifest-declared-count', {declared: manifest?.pages, actual: records.length});
  check(records.length === expected.length, null, 'manifest-route-count', {expected: expected.length, actual: records.length});

  const renderer = createHash('sha256');
  let rendererComplete = true;
  for (const file of rendererFiles) {
    const bytes = await read(path.join(root, 'scripts', file), null, 'renderer-input');
    if (bytes) renderer.update(bytes); else rendererComplete = false;
  }
  const rendererVersion = rendererComplete ? renderer.digest('hex') : null;
  check(rendererComplete && manifest?.version === rendererVersion, null, 'current-renderer-version', {expected: rendererVersion, actual: manifest?.version});
  check(Boolean(imageXml?.includes('http://www.google.com/schemas/sitemap-image/1.1')), null, 'image-sitemap-namespace');
  check(Boolean(robots?.toString().includes('Sitemap: ' + ORIGIN + '/sitemap-images.xml')), null, 'robots-image-sitemap-discovery');
  const sitemap = parseImageSitemap(imageXml?.toString() || '');
  const photoById = new Map((Array.isArray(photos) ? photos : []).map(p => [p.id, p]));
  const expectedPaths = new Set(expected.map(p => p.path)), byRoute = new Map(), byUrl = new Map(), byBytes = new Map();
  check(expectedPaths.size === expected.length, null, 'unique-inventory-routes');

  for (const record of records) {
    check(expectedPaths.has(record.route), record.route, 'no-unexpected-manifest-route');
    check(!byRoute.has(record.route), record.route, 'unique-manifest-route');
    check(!byUrl.has(record.src), record.route, 'unique-image-url', {src: record.src, otherRoute: byUrl.get(record.src)});
    byRoute.set(record.route, record);
    byUrl.set(record.src, record.route);
  }

  async function sourceCheck(source) {
    const cacheKey = JSON.stringify(source);
    if (sourceResults.has(cacheKey)) return sourceResults.get(cacheKey);
    const problems = [];
    const verify = (pass, name, details) => {if (!pass) problems.push({check: name, details});};
    verify(typeof source.id === 'string' && source.id.length > 0, 'source-id');
    const validPath = typeof source.src === 'string' && /^\/(assets|lataukset)\//.test(source.src)
      && !source.src.includes('..') && !/[?#\\]/.test(source.src);
    verify(validPath, 'source-path', source.src);
    verify(SHA256.test(source.sha256 || ''), 'source-checksum-format');
    const canonical = photoById.get(source.id);
    if (canonical) {
      for (const key of ['src', 'alt', 'author', 'license', 'licenseUrl', 'source']) {
        verify(source[key] === canonical[key], 'source-registry-' + key, {expected: canonical[key], actual: source[key]});
      }
      verify(source.sha256 === canonical.sha256, 'source-registry-checksum', {expected: canonical.sha256, actual: source.sha256});
    } else if (validPath && source.src.startsWith('/assets/photos/')) {
      // Derived textures can be declared separately; they need an explicit parent.
      verify(Boolean(source.derivedFrom && photoById.has(source.derivedFrom)), 'unregistered-photo-source', source.id);
    }
    let actual = null, sourceFile = null;
    if (validPath) {
      const candidateFiles = source.src.startsWith('/lataukset/')
        ? [path.join(out, source.src)]
        : [path.join(root, source.src), path.join(out, source.src)];
      for (const candidate of candidateFiles) {
        try {const bytes = await fs.readFile(candidate); actual = digest(bytes); sourceFile = path.relative(root, candidate); break;}
        catch (error) {if (error.code !== 'ENOENT') {problems.push({check: 'source-read', details: error.message}); break;}}
      }
      verify(actual !== null, 'source-file-exists', source.src);
      if (actual) verify(actual === source.sha256, 'source-file-checksum', {expected: source.sha256, actual});
    }
    const result = {id: source.id, src: source.src, file: sourceFile, sha256: actual, registryBound: Boolean(canonical), problems};
    sourceResults.set(cacheKey, result);
    return result;
  }

  async function renderAssetCheck(asset) {
    const cacheKey = JSON.stringify(asset);
    if (assetResults.has(cacheKey)) return assetResults.get(cacheKey);
    const problems = [];
    const validPath = typeof asset.src === 'string' && /^\/(assets|lataukset)\//.test(asset.src)
      && !asset.src.includes('..') && !/[?#\\]/.test(asset.src);
    if (!validPath) problems.push({check: 'render-asset-path', details: asset.src});
    if (typeof asset.role !== 'string' || !asset.role.trim()) problems.push({check: 'render-asset-role'});
    if (!SHA256.test(asset.sha256 || '')) problems.push({check: 'render-asset-checksum-format'});
    let actual = null;
    if (validPath) {
      try {
        actual = digest(await fs.readFile(path.join(out, asset.src)));
        if (actual !== asset.sha256) problems.push({check: 'render-asset-file-checksum', details: {expected: asset.sha256, actual}});
      } catch (error) {problems.push({check: 'render-asset-file', details: error.code || error.message});}
    }
    const result = {src: asset.src, role: asset.role, sha256: actual, problems};
    assetResults.set(cacheKey, result);
    return result;
  }

  for (const page of expected) {
    const route = page.path, before = failures.length, record = byRoute.get(route);
    if (!check(Boolean(record), route, 'manifest-record-present')) continue;
    const locale = page.locale || 'fi', indexable = Boolean(page.indexable) && !['/404/', '/valokuvat-ja-lisenssit/'].includes(route);
    const imageUrl = ORIGIN + record.src, pageUrl = ORIGIN + route;
    const validImagePath = typeof record.src === 'string' && /^\/assets\/social\/[^/]+\.jpg$/.test(record.src)
      && !record.src.includes('..') && !/[?#\\]/.test(record.src);
    check(validImagePath, route, 'image-path', record.src);
    check(record.width === 1200 && record.height === 630, route, 'manifest-dimensions', {width: record.width, height: record.height});
    check(record.type === 'image/jpeg', route, 'manifest-mime', record.type);
    check(record.locale === locale, route, 'manifest-locale', {expected: locale, actual: record.locale});
    check(record.renderer === rendererVersion, route, 'record-renderer-version');
    check(typeof record.alt === 'string' && record.alt.trim().length > 0, route, 'manifest-alt');
    check(SHA256.test(record.sha256 || ''), route, 'image-checksum-format');
    if (validImagePath) {
      const bytes = await read(path.join(out, record.src), route, 'image-file');
      if (bytes) {
        const hash = digest(bytes);
        check(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff, route, 'jpeg-magic');
        check(bytes.length > 0 && bytes.length <= MAX_BYTES, route, 'image-byte-budget', {bytes: bytes.length, maximum: MAX_BYTES});
        check(bytes.length === record.bytes, route, 'manifest-byte-length', {expected: record.bytes, actual: bytes.length});
        check(hash === record.sha256, route, 'image-file-checksum', {expected: record.sha256, actual: hash});
        if (!byBytes.has(hash)) byBytes.set(hash, []);
        byBytes.get(hash).push(route);
        try {
          const metadata = await sharp(bytes, {failOn: 'error'}).metadata();
          check(metadata.format === 'jpeg', route, 'decoded-image-format', metadata.format);
          check(metadata.width === 1200 && metadata.height === 630, route, 'decoded-image-dimensions', {width: metadata.width, height: metadata.height});
          check(!metadata.pages || metadata.pages === 1, route, 'single-image');
        } catch (error) {check(false, route, 'image-decode', error.message);}
      }
    }

    const sources = Array.isArray(record.sources) ? record.sources : [];
    check(Array.isArray(record.sources) && Array.isArray(record.sourceIds), route, 'source-list-shape');
    check(JSON.stringify(record.sourceIds) === JSON.stringify(sources.map(source => source?.id)), route, 'source-id-list');
    check(new Set(sources.map(source => source?.id)).size === sources.length, route, 'unique-source-ids');
    for (const source of sources) {
      if (!source || typeof source !== 'object') {check(false, route, 'source-record-shape'); continue;}
      const result = await sourceCheck(source);
      check(result.problems.length === 0, route, 'source-integrity', {id: source.id, problems: result.problems});
    }
    const renderAssets = Array.isArray(record.renderAssets) ? record.renderAssets : [];
    check(Array.isArray(record.renderAssets), route, 'render-asset-list-shape');
    check(new Set(renderAssets.map(asset => asset?.src)).size === renderAssets.length, route, 'unique-render-assets');
    for (const asset of renderAssets) {
      if (!asset || typeof asset !== 'object') {check(false, route, 'render-asset-record-shape'); continue;}
      const result = await renderAssetCheck(asset);
      check(result.problems.length === 0, route, 'render-asset-integrity', {src: asset.src, problems: result.problems});
    }
    // These renderers read generated files in dist, separately from original photos.
    if (record.family === 'print') {
      const prefix = `kalenteri-${record.year || 2027}${record.month ? '-' + String(record.month).padStart(2, '0') : ''}`;
      for (const style of ['helsinki', 'jarvimaisema', 'suomen-kartta']) {
        const src = '/lataukset/' + prefix + '-' + style + '-preview.webp';
        check(renderAssets.some(asset => asset?.src === src && asset.role === 'print-preview'), route, 'print-preview-source-recorded', src);
      }
    }
    if (record.family === 'seasons') for (const name of ['kevat', 'kesa', 'syksy', 'talvi']) {
      const src = '/assets/seasons/2027-' + name + '-1200.webp';
      check(renderAssets.some(asset => asset?.src === src && asset.role === 'season-illustration'), route, 'season-source-recorded', src);
    }
    if (['lunar', 'moonrise'].includes(record.family)) check(renderAssets.some(asset => asset?.src === '/assets/photos/moon-surface.jpg'
      && asset.role === 'moon-texture'), route, 'moon-texture-source-recorded');

    const html = await read(route === '/404/' ? path.join(out, '404.html') : path.join(out, route, 'index.html'), route, 'page-html');
    const head = html && parseHead(html.toString());
    if (check(Boolean(head), route, 'html-head')) {
      const meta = (key, value) => {
        const values = head.meta.get(key) || [];
        check(values.length === 1 && values[0] === value, route, 'meta:' + key, {expected: value, actual: values});
      };
      const fullTitle = page.seoTitle || brandedTitle(page.title);
      check(head.title === fullTitle, route, 'html-title', {expected: fullTitle, actual: head.title});
      const canonical = head.links.filter(link => (link.rel || '').toLowerCase().split(/\s+/).includes('canonical'));
      check(canonical.length === 1 && canonical[0].href === pageUrl, route, 'canonical', canonical.map(link => link.href));
      meta('description', page.description);
      meta('og:title', fullTitle);
      meta('og:description', page.description);
      meta('og:url', pageUrl);
      meta('og:type', /^\/blogi\/[^/]+\/$/.test(route) ? 'article' : 'website');
      meta('og:locale', locale === 'sv' ? 'sv_FI' : 'fi_FI');
      meta('og:site_name', 'Kalenteri365');
      meta('og:image', imageUrl);
      meta('og:image:secure_url', imageUrl);
      meta('og:image:type', 'image/jpeg');
      meta('og:image:width', '1200');
      meta('og:image:height', '630');
      meta('og:image:alt', record.alt);
      meta('twitter:card', 'summary_large_image');
      meta('twitter:title', fullTitle);
      meta('twitter:description', page.description);
      meta('twitter:image', imageUrl);
      meta('twitter:image:alt', record.alt);
      const robotsMeta = head.meta.get('robots') || [], directives = robotsMeta.join(',').toLowerCase().split(/\s*,\s*/);
      check(robotsMeta.length === 1, route, 'single-robots-meta');
      check(directives.includes('max-image-preview:large'), route, 'large-image-preview');
      check(directives.includes(indexable ? 'index' : 'noindex') && !directives.includes(indexable ? 'noindex' : 'index'), route, 'robots-indexability', {indexable, directives});
      check(directives.includes('follow') && !directives.some(directive => ['nofollow', 'noimageindex', 'none'].includes(directive)), route, 'robots-images-followable');
      const schemas = [];
      for (const json of head.json) {
        try {schemas.push(JSON.parse(json));}
        catch (error) {check(false, route, 'json-ld-valid', error.message);}
      }
      const primary = schemas.flatMap(schema => findValues(schema, 'primaryImageOfPage')).flat();
      check(primary.length === 1, route, 'single-primary-image', primary.length);
      for (const image of primary) {
        check(image && typeof image === 'object' && image['@type'] === 'ImageObject', route, 'primary-image-object');
        check(image?.url === imageUrl && image?.contentUrl === imageUrl, route, 'primary-image-url', {expected: imageUrl, url: image?.url, contentUrl: image?.contentUrl});
        check(image?.width === 1200 && image?.height === 630 && image?.encodingFormat === 'image/jpeg', route, 'primary-image-format');
        check(image?.caption === record.alt, route, 'primary-image-caption');
      }
      if (/^\/blogi\/[^/]+\/$/.test(route)) {
        const articles = schemas.flatMap(schema => findTypes(schema, 'BlogPosting'));
        check(articles.length === 1, route, 'single-article-schema');
        for (const article of articles) {
          const images = [article.image].flat();
          check(images.some(image => typeof image === 'string' ? image === imageUrl : image?.url === imageUrl || image?.contentUrl === imageUrl), route, 'article-image-matches-og');
        }
      }
    }
    const listedImages = sitemap.get(pageUrl) || [];
    check(indexable ? listedImages.filter(url => url === imageUrl).length === 1 : !sitemap.has(pageUrl), route, 'image-sitemap-indexability', {indexable, socialImageEntries: listedImages.filter(url => url === imageUrl).length});
    pageResults.push({route, src: record.src, family: record.family, locale, indexable, sources: sources.length,
      renderAssets: renderAssets.length, passed: failures.length === before});
  }

  for (const pageUrl of sitemap.keys()) {
    check(pageUrl.startsWith(ORIGIN + '/') && expectedPaths.has(pageUrl.slice(ORIGIN.length)), pageUrl, 'image-sitemap-known-page');
  }
  const duplicateBytes = [...byBytes].filter(([, routes]) => routes.length > 1).map(([sha256, routes]) => ({sha256, routes}));
  const report = {
    at: new Date().toISOString(), scope: 'Local generated files; no public HTTP or crawler-cache verification.',
    pages: expected.length, catalogPages: Array.isArray(pages) ? pages.length : 0,
    checkedPages: pageResults.length, manifestImages: records.length, uniqueImageUrls: byUrl.size,
    uniqueImageBytes: byBytes.size, byteBudget: MAX_BYTES, rendererVersion, checks,
    indexablePages: pageResults.filter(page => page.indexable).length,
    passedPages: pageResults.filter(page => page.passed).length,
    sources: sourceResults.size, sourceFailures: [...sourceResults.values()].filter(source => source.problems.length).length,
    renderAssets: assetResults.size, renderAssetFailures: [...assetResults.values()].filter(asset => asset.problems.length).length,
    duplicateImageBytes: duplicateBytes, failures, pageResults, sourceResults: [...sourceResults.values()], renderAssetResults: [...assetResults.values()],
  };
  await fs.mkdir(path.join(root, 'reports'), {recursive: true});
  await fs.writeFile(path.join(root, 'reports/social-audit.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditSocial();
  console.log(JSON.stringify({pages: report.pages, checkedPages: report.checkedPages, uniqueImageUrls: report.uniqueImageUrls,
    sources: report.sources, checks: report.checks, failures: report.failures.length, report: 'reports/social-audit.json'}, null, 2));
  if (report.failures.length) process.exitCode = 1;
}
