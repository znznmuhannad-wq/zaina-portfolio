import html from '@/components/markup/highlighted-projects';

export default function HighlightedProjects() {
  return (
    <section
      id="highlighted-projects"
      className="petra-section fluid-section-py fluid-section-px relative z-20 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
