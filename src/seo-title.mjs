// Finnish compound-word hyphens and year ranges are not title separators.
export function brandedTitle(value) {
  let title = String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
  while (/\s[|–—-]\s*Kalenteri365(?:\.fi)?$/iu.test(title)) {
    title = title.replace(/\s[|–—-]\s*Kalenteri365(?:\.fi)?$/iu, '').trim();
  }
  title = title.replace(/\s[–—-]\s|:\s+/gu, ' | ').replace(/\s*\|\s*/gu, ' | ');
  if (!title) throw new Error('A page-specific SEO title is required');
  return title + ' | Kalenteri365';
}
