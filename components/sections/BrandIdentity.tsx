'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { brandPages, brandBookUrl } from '@/data/brand';

/**
 * Brand Identity showcase — a dedicated, self-contained section for the
 * "Z Creative Studio" brand book. It ships its own horizontal carousel and
 * fullscreen lightbox in React state, so it adds ZERO coupling to the legacy
 * portfolio runtime (public/portfolio.runtime.js) and cannot affect any
 * existing behaviour. Styling uses the same design tokens as the rest of the
 * site (warm_beige / charcoal / teal_primary / sage, Space Grotesk).
 */
export default function BrandIdentity() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // ---- Carousel: arrow + pointer-drag scrolling (native touch scroll on mobile) ----
  const scrollByCards = useCallback((dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-brand-card]');
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return; // touch uses native scrolling
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
      // Prevent the drag-release from registering as a card click
      if (moved) setTimeout(() => (el.dataset.dragged = ''), 0);
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // ---- Lightbox controls ----
  const close = useCallback(() => setLightbox(null), []);
  const nav = useCallback(
    (dir: number) =>
      setLightbox((i) => (i === null ? i : (i + dir + brandPages.length) % brandPages.length)),
    []
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') nav(1);
      else if (e.key === 'ArrowLeft') nav(-1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, close, nav]);

  // Touch swipe inside the lightbox
  const touchX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.changedTouches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) nav(dx < 0 ? 1 : -1);
  };

  const openCard = (i: number) => {
    const el = trackRef.current;
    if (el && el.dataset.dragged === '') {
      // just finished a drag — swallow this click
      delete el.dataset.dragged;
      return;
    }
    setLightbox(i);
  };

  return (
    <section
      id="brand-identity"
      className="fluid-section-py fluid-section-px relative z-20 overflow-hidden"
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="reveal text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h3 className="text-xs sm:text-sm uppercase tracking-widest font-bold mb-4 text-teal_primary">
            Brand Identity
          </h3>
          <h2 className="font-space font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
            Z Creative Studio — Brand Book
          </h2>
          <p className="font-inter text-sm md:text-base text-subtitle_beige leading-relaxed">
            My own complete visual identity system — a 39-page guide covering the logo philosophy,
            colour palette, typography, patterns and real product mockups. Real creativity starts
            with chaos but ends with a system.
          </p>

          {brandBookUrl && (
            <a
              href={brandBookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-full font-space font-bold text-white shadow-lg bg-teal_primary hover:scale-105 active:scale-95 transition-transform text-sm md:text-base"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Brand Book
            </a>
          )}
        </div>

        {/* Carousel */}
        <div className="reveal relative">
          <div
            ref={trackRef}
            className="brand-track flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-1 px-1"
          >
            {brandPages.map((src, i) => (
              <button
                key={src}
                data-brand-card
                type="button"
                onClick={() => openCard(i)}
                aria-label={`Open brand book page ${i + 1} of ${brandPages.length}`}
                className="group/brand snap-center shrink-0 w-[82%] sm:w-[55%] lg:w-[38%] xl:w-[31%] rounded-2xl overflow-hidden border border-sage/30 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal_primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Z Creative Studio brand book — page ${i + 1}`}
                  width={1440}
                  height={810}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  className="w-full h-auto aspect-video object-cover select-none"
                />
              </button>
            ))}
          </div>

          {/* Arrows (desktop) */}
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous brand pages"
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-sage/40 shadow-md items-center justify-center text-charcoal hover:bg-teal_primary hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next brand pages"
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-sage/40 shadow-md items-center justify-center text-charcoal hover:bg-teal_primary hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Brand book page ${lightbox + 1} of ${brandPages.length}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandPages[lightbox]}
            alt={`Z Creative Studio brand book — page ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[92vw] w-auto h-auto rounded-xl shadow-2xl"
            draggable={false}
          />

          <button
            type="button"
            onClick={() => nav(-1)}
            aria-label="Previous page"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => nav(1)}
            aria-label="Next page"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-space tracking-wide">
            {lightbox + 1} / {brandPages.length}
          </span>
        </div>
      )}
    </section>
  );
}
