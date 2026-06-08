/**
 * Brand Identity section data.
 * The 39 brand-book pages were exported from the source PDF to web-optimized
 * JPEGs under /public/brand (01.jpg … 39.jpg), 1440×810 each.
 */
export const BRAND_PAGE_COUNT = 39;

export const brandPages: string[] = Array.from(
  { length: BRAND_PAGE_COUNT },
  (_, i) => `/brand/${String(i + 1).padStart(2, '0')}.jpg`
);

/**
 * Full brand book (PDF) download link.
 * The source PDF is ~109 MB — too large to host in the repo — so this should be
 * a Google Drive (or similar) share link, like the CV link in the Contact
 * section. Leave empty to hide the download button.
 */
export const brandBookUrl = '';
