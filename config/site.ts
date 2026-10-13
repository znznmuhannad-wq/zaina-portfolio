/**
 * Centralized site/SEO configuration. Values mirror the legacy <meta> tags
 * exactly (no content changes) so the rendered <head> is equivalent — just now
 * sourced from one typed place and emitted via the Next.js Metadata API.
 */
export const siteConfig = {
  name: 'Z Creative Studio | Zaina Alissa',
  title: 'Z Creative Studio | Zaina Alissa',
  description:
    'Digital Designer & Developer specializing in brand identity, UX/UI, web development, social media and paid campaigns.',
  url: 'https://zainaalissa.com/',
  ogImage: 'https://i.ibb.co/zHVQT1S9/00.png',
  favicon: 'https://i.ibb.co/PZ7PVdpT/22.png',
  locale: 'en',
} as const;

export type SiteConfig = typeof siteConfig;
