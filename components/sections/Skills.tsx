import html from '@/components/markup/skills';

export default function Skills() {
  return (
    <section
      id="skills"
      className="fluid-section-py fluid-section-px -mt-8 md:-mt-12 relative z-10 overflow-visible overflow-x-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
