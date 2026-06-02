import type { Metadata } from 'next';
import Script from 'next/script';
import { siteConfig } from '@/config/site';
import RuntimeScripts from '@/components/runtime/RuntimeScripts';
import './fonts.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: siteConfig.favicon,
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

// Anti-flash theme bootstrap — runs before paint, verbatim from the legacy head.
const themeInit = `(function(){
  var s = localStorage.getItem('zcreative-theme');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (s === 'dark' || (!s && systemDark)) {
    document.documentElement.setAttribute('data-theme','dark');
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect / dns-prefetch to the media CDNs. Fonts are now self-hosted
            (app/fonts.css + /public/fonts), so the Google Fonts CDN is no longer used. */}
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="preconnect" href="https://files.catbox.moe" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://files.catbox.moe" />
        {/* Preload the LCP hero image for a faster Largest Contentful Paint. */}
        <link
          rel="preload"
          as="image"
          href="https://i.ibb.co/zHVQT1S9/00.png"
          fetchPriority="high"
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
      </head>
      <body className="overflow-x-hidden">
        {children}
        <RuntimeScripts />
      </body>
    </html>
  );
}
