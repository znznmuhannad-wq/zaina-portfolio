import html from '@/components/markup/plastic-art';

export default function PlasticArt() {
  return (
    <section
      id="plastic-art-section"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
