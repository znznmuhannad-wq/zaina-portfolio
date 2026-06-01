import html from '@/components/markup/footer';

export default function Footer() {
  return (
    <footer
      className="py-10 md:py-12 fluid-section-px bg-charcoal text-white border-t border-white/5 relative z-30"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
