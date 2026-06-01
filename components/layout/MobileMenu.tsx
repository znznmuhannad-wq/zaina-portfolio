import html from '@/components/markup/mobile-menu';

export default function MobileMenu() {
  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 z-[60] bg-warm_beige flex-col items-center justify-center gap-6 text-2xl font-space font-bold hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
