import html from '@/components/markup/portfolio';

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="fluid-section-py fluid-section-px relative z-20"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
