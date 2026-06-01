import html from '@/components/markup/education';

export default function Education() {
  return (
    <section
      id="education"
      className="fluid-section-py fluid-section-px bg-warm_beige relative z-20"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
