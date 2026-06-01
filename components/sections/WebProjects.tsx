import html from '@/components/markup/web-projects';

export default function WebProjects() {
  return (
    <section
      id="web-projects"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
