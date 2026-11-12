# Kalenteri365.fi

Finnish calendar and planning site, prepared for Cloudflare Pages deployments from `main`.

## Build

Node.js 22 or newer. No npm dependencies.

```sh
npm test
npm run build
npm run dev
```

Cloudflare Pages settings: framework **None**, build command **npm test && npm run build**, output directory **dist**. The server prints `http://127.0.0.1:4173` for local previews.

The build generates 71 Finnish pages (plus a 404 page) and 52 A4 landscape vector PDFs for 2027–2030. Calendars use Monday-first grids and ISO week numbers. Personal all-day events, notes and tasks stay in browser localStorage. ICS exports include events, not notes or tasks.

## Sources and limits

Finnish holiday rules: University of Helsinki Almanac Office. School holiday data: Helsinki's confirmed Finnish-language municipal school terms for 2026–2028. These are not presented as nationwide dates. Christmas Eve and Midsummer Eve are labeled separately and optionally excluded from the Monday–Friday workday model. Vacation estimates are not a full annual leave entitlement calculation.

Sunrise and sunset are approximate NOAA-equation results for selected Finnish cities, displayed in Europe/Helsinki. No weather API or IP-location tracking is used. No licensed name-day database is reproduced.

The site uses Lato from Google Fonts. PDF files use PDF-standard Helvetica with WinAnsi encoding for Finnish characters. Original SVG landscape and icon artwork lives in `src/ui.js`.

## Structure

- `src/calendar.js`: date, holiday, workday, ICS and solar calculations.
- `src/ui.js`: shared accessible HTML rendering and original SVG artwork.
- `src/app.js`: browser-local planner and interactive tools.
- `src/style.css`: responsive layout and print styles.
- `scripts/build.mjs`: static pages, sitemap, metadata and Cloudflare headers.
- `scripts/pdf.mjs`: dependency-free vector PDF generator.
- `scripts/calendar.test.mjs`: date boundaries, Finnish holiday anchors, workday/ICS/solar/PDF checks.

Sources were checked on 12 November 2026. Deployment is not verified until the Cloudflare project reports a successful build and the public domain has been checked.
