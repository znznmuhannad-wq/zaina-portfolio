import html from '@/components/markup/hero';

export default function Hero() {
  return (
    <section
      className="hero-section-mobile relative min-h-screen flex items-center pt-24 pb-12 fluid-section-px overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
