# Kalenteri365.fi

Finnish calendar and planning site for 2027–2030, inspired by the owner's Kalendars365.lv and Koledar365.si projects. The implementation generates searchable static HTML, then adds browser-local planning interactions. No server database or paid runtime service is needed.

## Build

Requires Node.js 22 or newer (24 recommended). Install the exact dependencies from `pnpm-lock.yaml`:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm build
corepack pnpm start
```

The output is `dist/`. The build verifies Lato TTF checksums, generates Finnish calendars, tool and editorial pages, and creates 780 vector calendar PDFs and 780 A4 WebP downloads at 600 ppi, plus 208 lunar and 16 planner PDF/Image pairs, plus lightweight gallery previews. The first build rasterizes the downloads and takes several minutes. Unchanged local exports are cached by the source hash. The source repository intentionally excludes generated output, local personal records and downloaded fonts. The font license is included; fonts are fetched from Google Fonts and checked against fixed SHA-256 values.

## Cloudflare Pages

Existing Pages project `kalenteri365-fi` is connected to `mateopedersen/kalenteri365-fi`:

| Setting | Value |
|---|---|
| Branch | `main` |
| Framework | None |
| Build command | `npm test && npm run build` |
| Output directory | `dist` |
| Node version | `24` (`.node-version`) |

Connect `kalenteri365.fi` and `www.kalenteri365.fi` as custom domains. `_redirects` sends www to the canonical apex. Do not add an SPA wildcard fallback: unknown paths must keep their 404 status. `_headers` contains security headers and asset caching rules.

## Features

- Annual and monthly calendars, Monday-first ISO weeks, Finnish public holidays, eves and flag days.
- Month, week, day, list and year views. Events, simple repeat rules, notes and tasks stored in localStorage.
- ICS import/export and JSON backup/restore. Imports support date-only and Helsinki/UTC timed events, basic daily/weekly/monthly/yearly recurrence, interval, until and excluded dates. Unsupported complex recurrence or foreign TZID events are reported as skipped rather than silently changed. Cross-device sync is not implemented.
- Date differences, date arithmetic, business days, working hours, day-of-year, leap years, holiday planning and shift cycles.
- Calendar editor with a local photo, color and title; PDF, Word, Excel, JPEG and PNG downloads. The family planner adds people, dated events, meals and a weekly shopping list, with Helsinki-aware ICS export. Weekly, daily, school and study planners save browser-local fields.
- Filterable tool directory with persistent favourites. Twenty Finnish blog articles with contextual links, licensed photography and legacy guide redirects.
- Astronomy Engine 2.1.19: lunar phases, local rise/set, polar conditions, seasons and eclipses. 25 Finnish locations, each with 2027–2030 comparisons. MET Norway model forecast weather for the chosen city.
- Official source links for copyrighted name-day data, individual benefit dates and examination timetables. Published municipal school holidays are scoped to their actual municipality, school type and school year; unpublished future dates are not invented.

## Verification

`pnpm test` covers all 48 month grids and 1,461 civil dates, ISO boundaries, Finnish movable holidays, business-day conventions, UTF-8 ICS folding, lunar phases, polar days and DST boundary rise/set calculations. `pnpm check` checks all generated HTML links, language, H1/canonical/structured data, single-page PDFs, A4 raster dimensions and actual EXIF 600 ppi metadata. Reports are in `reports/`.

Source and editorial limitations appear on `/lahteet/`. Horoscopes are explicitly dated entertainment reflections, not predictions. The name-day service links to the licensor rather than republishing its protected database.

## Canonical host

Cloudflare Single Redirect `Kalenteri365 www to canonical` sends `https://www.kalenteri365.fi/*` to `https://kalenteri365.fi/${1}` with HTTP 301 and preserves the query string. Domain redirects are configured at zone level because Pages `_redirects` supports path redirects only. Keep this rule when changing builds or custom domains.
