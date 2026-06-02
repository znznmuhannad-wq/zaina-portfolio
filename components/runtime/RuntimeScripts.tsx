'use client';

import Script from 'next/script';

/**
 * Loads the verbatim portfolio runtime (carousels, lightbox, mute registry,
 * dark-mode, plastic-art book, draggable hero card, reveal-on-scroll).
 *
 * Icons are now inlined as static SVG at build time, so the Lucide library is
 * no longer loaded at all — this removes ~402 KB of third-party JavaScript and
 * one cross-origin connection.
 */
export default function RuntimeScripts() {
  return <Script src="/portfolio.runtime.js" strategy="afterInteractive" />;
}
