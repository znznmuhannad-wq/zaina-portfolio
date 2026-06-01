'use client';

import Script from 'next/script';

/**
 * Loads the icon library and the verbatim portfolio runtime.
 *
 * - Lucide is loaded from its CDN and, once ready, we explicitly call
 *   createIcons(). The legacy page relied on Lucide's own DOMContentLoaded
 *   auto-init; under Next's afterInteractive timing that event has already
 *   fired, so the explicit onLoad call is what guarantees every `data-lucide`
 *   icon in the server-rendered markup is rendered. (Idempotent — safe.)
 * - portfolio.runtime.js is the original behaviour script, byte-for-byte,
 *   running in global scope so inline onclick handlers resolve exactly as before.
 */
export default function RuntimeScripts() {
  return (
    <>
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          window.lucide?.createIcons({
            attrs: { class: ['lucide'] },
            nameAttr: 'data-lucide',
          });
        }}
      />
      <Script src="/portfolio.runtime.js" strategy="afterInteractive" />
    </>
  );
}
