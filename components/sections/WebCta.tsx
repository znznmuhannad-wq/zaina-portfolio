import html from '@/components/markup/web-cta';

export default function WebCta() {
  return (
    <section
      id="web-cta"
      className="web-cta-section bg-warm_beige pt-0 pb-12 md:pb-16 px-4 md:px-8 relative z-20 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
