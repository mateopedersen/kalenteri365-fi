// Keep discovery identical on Finnish, Swedish and error pages. URLs remain stable.
export const ICO_SIZES = [16, 32, 48, 96, 256];
export const PNG_SIZES = [16, 32, 48, 96, 180, 192, 512];
export function siteIconLinks() {
  return `<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="${ICO_SIZES.map(n=>`${n}x${n}`).join(' ')}"><link rel="icon" href="/assets/icon-96.png" type="image/png" sizes="96x96"><link rel="icon" href="/assets/icon.svg" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="/assets/icon-180.png" sizes="180x180"><link rel="manifest" href="/site.webmanifest">`;
}
