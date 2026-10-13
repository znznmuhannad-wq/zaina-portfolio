import html from '@/components/markup/tools';

export default function Tools() {
  return (
    <section
      id="tools"
      className="fluid-section-py fluid-section-px relative z-10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
