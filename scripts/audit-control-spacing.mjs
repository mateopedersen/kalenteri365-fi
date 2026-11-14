import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Uses a developer-provided Playwright installation; never installs a browser or
// contacts production. Run against the local built site with scripts/serve.mjs.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SPACING_BASE_URL || 'http://127.0.0.1:4186';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname)) {
  throw new Error('The spacing audit must use a local preview.');
}
const pages = JSON.parse(await fs.readFile(path.join(ROOT, 'reports/pages.json'), 'utf8'));
const topLevel = process.argv.includes('--top-level');
const selected = topLevel ? pages.filter(p => p.path.split('/').filter(Boolean).length <= 1 ||
  p.path.startsWith('/horoskooppi/')) : pages;
const paths = [...new Set([...selected.map(p => p.path), '/404.html'])];
const widths = topLevel ? [320, 390, 768, 1440] : [390, 1440];
const interactive = process.argv.includes('--interactive');
const results = [];
let scanned = 0;

function inspectSpacing() {
  const visible = e => {
    if (!e || e.getBoundingClientRect().width <= 0 || e.getBoundingClientRect().height <= 0) return false;
    const closed = e.closest('details:not([open])');
    return !closed || closed.querySelector(':scope > summary')?.contains(e);
  };
  const control = 'button,a.btn,a[role=button],a.topic-open,a.section-link';
  const describe = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
    [...e.classList].slice(0, 3).map(c => '.' + c).join('');
  const issues = [];
  // Check rendered prose at action boundaries, including wrappers and hidden
  // result placeholders. Inline links, labels and text inside buttons are not
  // separate prose blocks and are deliberately excluded.
  for (const text of document.querySelectorAll('main p,main small')) {
    if (!visible(text) || text.textContent.trim().length < 24 ||
        text.closest('button,a,summary,label') || text.querySelector(control)) continue;
    const tr = text.getBoundingClientRect();
    for (const direction of ['before', 'after']) {
      let peer = direction === 'before' ? text.previousElementSibling : text.nextElementSibling;
      while (peer && !visible(peer)) {
        peer = direction === 'before' ? peer.previousElementSibling : peer.nextElementSibling;
      }
      if (!peer) continue;
      const controls = [...(peer.matches(control) ? [peer] : []),
        ...peer.querySelectorAll(control)].filter(visible);
      const pr = peer.getBoundingClientRect();
      for (const c of controls) {
        const cr = c.getBoundingClientRect();
        if (Math.min(tr.right, cr.right) - Math.max(tr.left, cr.left) < 20) continue;
        const gap = direction === 'before' ? tr.top - cr.bottom : cr.top - tr.bottom;
        const edge = direction === 'before' ? pr.bottom - cr.bottom : cr.top - pr.top;
        if (gap >= -2 && gap < 12 && edge < 12) {
          issues.push({text: text.textContent.trim().slice(0, 100),
            control: c.textContent.trim().slice(0, 60), gap: Math.round(gap * 10) / 10,
            direction, parent: describe(text.parentElement),
            textSelector: describe(text), peer: describe(peer), controlSelector: describe(c)});
        }
      }
    }
  }
  return issues;
}

function inspectControlFit() {
  const visible = e => {
    const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    const closed = e.closest('details:not([open])');
    return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' &&
      s.display !== 'none' && !e.closest('[hidden],.sr-only') &&
      (!closed || closed.querySelector(':scope > summary')?.contains(e));
  };
  const describe = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
    [...e.classList].slice(0, 3).map(c => '.' + c).join('');
  const issues = [];
  const controls = [...document.querySelectorAll(
    'main button,main a.btn,main [role=button],main input,main select,main textarea'
  )].filter(visible);
  const textOutside = (e, strictVertical = true) => {
    const box = e.getBoundingClientRect(), walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    // A heading's font-leading rectangle can exceed its line box without
    // clipping any glyphs. Prose is vertically constrained by a clipping
    // container, whereas a button's label must stay inside the button itself.
    let verticalBox = strictVertical ? box : null;
    if (!strictVertical) {
      for (let ancestor = e; ancestor; ancestor = ancestor.parentElement) {
        if (['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(ancestor).overflowY)) {
          verticalBox = ancestor.getBoundingClientRect();
          break;
        }
      }
    }
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim() || !visible(node.parentElement) ||
          node.parentElement.closest('svg,.sr-only,[aria-hidden=true],input,textarea,select')) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        if (line.width > 1 && (line.left < box.left - 2 || line.right > box.right + 2 ||
            (verticalBox && (line.top < verticalBox.top - 2 || line.bottom > verticalBox.bottom + 2)))) {
          return node.textContent.trim().slice(0, 80);
        }
      }
    }
    return null;
  };
  for (const control of controls) {
    const box = control.getBoundingClientRect();
    const entry = {selector: describe(control), parent: describe(control.parentElement),
      label: control.textContent.trim().slice(0, 70)};
    if (control.matches('button,a,[role=button]')) {
      if (control.scrollWidth > control.clientWidth + 2 || control.scrollHeight > control.clientHeight + 2) {
        issues.push({...entry, kind: 'control-overflow'});
      }
      const text = textOutside(control);
      if (text) issues.push({...entry, kind: 'control-text-outside', text});
    }
    // A scrollable preview may intentionally be wider than its viewport. Its
    // scrolling is not a card overflow; normal control groups must fit.
    if (!control.closest('[class*=scroll],.solar-stage,.studio-preview')) {
      const parent = control.parentElement.getBoundingClientRect();
      if (parent.width > 1 && box.width > 40 &&
          (box.left < parent.left - 2 || box.right > parent.right + 2)) {
        issues.push({...entry, kind: 'control-outside-parent'});
      }
    }
  }
  for (let i = 0; i < controls.length; i++) {
    const a = controls[i], ar = a.getBoundingClientRect();
    for (const b of controls.slice(i + 1)) {
      if (a.parentElement !== b.parentElement || a.contains(b) || b.contains(a)) continue;
      const br = b.getBoundingClientRect();
      if (Math.min(ar.right, br.right) - Math.max(ar.left, br.left) > 3 &&
          Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top) > 3) {
        const preview = [a, b].find(e => e.matches('.print-preview-open'));
        const favourite = [a, b].find(e => e.matches('.print-save'));
        // The catalogue intentionally puts a separate favourite icon over the
        // picture's click area. It must not cover the preview's text label.
        if (preview && favourite) {
          const label = preview.querySelector(':scope > span')?.getBoundingClientRect();
          const icon = favourite.getBoundingClientRect();
          if (label && icon.width <= 48 && icon.height <= 48 &&
              (icon.bottom <= label.top || icon.right <= label.left || icon.left >= label.right)) continue;
        }
        issues.push({selector: describe(a), parent: describe(a.parentElement),
          other: describe(b), kind: 'overlapping-controls'});
      }
    }
  }
  for (const e of document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main label')) {
    if (!visible(e) || e.closest('button,a.btn,[role=button],summary')) continue;
    const text = textOutside(e, false);
    if (text) issues.push({selector: describe(e), parent: describe(e.parentElement),
      kind: 'prose-outside-box', text});
  }
  if (document.documentElement.scrollWidth > innerWidth + 2) {
    issues.push({kind: 'page-overflow', pixels: document.documentElement.scrollWidth - innerWidth});
  }
  return issues;
}

await Promise.all(widths.map(async width => {
  let browser, context, page;
  const close = async () => {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  };
  const reset = async () => {
    await close();
    browser = await chromium.launch({channel: 'chrome'});
    context = await browser.newContext({javaScriptEnabled: interactive, viewport: {width, height: 900}});
    if (interactive) await context.addInitScript(() =>
      localStorage.setItem('fi-storage-notice-until', '9999999999999'));
    page = await context.newPage();
  };
  try {
    for (let index = 0; index < paths.length; index++) {
      // Bound the browser's decoded-image and font caches across a large
      // catalogue. A disconnected browser never makes subsequent routes pass.
      if (index % 40 === 0 || !browser?.isConnected()) await reset();
      const route = paths[index];
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await page.goto(new URL(route, base).href, {waitUntil: 'domcontentloaded', timeout: 20000});
          await page.waitForFunction(() => document.querySelector('link[rel=stylesheet]')?.sheet);
          await page.evaluate(() => document.fonts.ready);
          if (interactive) await page.waitForTimeout(150);
          results.push({path: route, width, issues: await page.evaluate(inspectSpacing),
            fitIssues: await page.evaluate(inspectControlFit)});
          break;
        } catch (error) {
          if (attempt === 0) await reset();
          else results.push({path: route, width, error: error.message});
        }
      }
      scanned++;
      if (scanned % 100 === 0) console.log(`Scanned ${scanned}/${paths.length * widths.length}`);
    }
  } finally {
    await close();
  }
}));

const report = {at: new Date().toISOString(), base, mode: interactive ? 'interactive' : 'server-rendered',
  pages: paths.length, widths, scanned, errors: results.filter(r => r.error).length,
  affectedViews: results.filter(r => r.issues?.length || r.fitIssues?.length).length,
  issueCount: results.reduce((n, r) => n + (r.issues?.length || 0) + (r.fitIssues?.length || 0), 0), results};
const destination = process.env.SPACING_REPORT || path.join(ROOT, 'reports/control-spacing-audit.json');
await fs.writeFile(destination, JSON.stringify(report, null, 2));
console.log(JSON.stringify({scanned, errors: report.errors, affectedViews: report.affectedViews,
  issueCount: report.issueCount, report: destination}, null, 2));
if (report.errors || report.issueCount) process.exitCode = 1;
