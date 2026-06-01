import type { Metadata } from 'next';
import Script from 'next/script';
import { siteConfig } from '@/config/site';
import RuntimeScripts from '@/components/runtime/RuntimeScripts';
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
        {/* Preconnect / dns-prefetch to media + font CDNs (verbatim from legacy head) */}
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="preconnect" href="https://files.catbox.moe" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://files.catbox.moe" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Inter:wght@300;400;600&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
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
