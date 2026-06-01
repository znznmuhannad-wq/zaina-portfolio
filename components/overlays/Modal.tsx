'use client';

import html from '@/components/markup/modal';

/**
 * Showcase lightbox. Client component because the backdrop click handler is a
 * DOM event. The handler itself lives in the verbatim runtime (window.*); inner
 * controls (close / nav / mute) keep their native inline onclick attributes.
 */
export default function Modal() {
  return (
    <div
      id="showcase-modal"
      onClick={(e) => window.handleModalBackdropClick?.(e.nativeEvent)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
