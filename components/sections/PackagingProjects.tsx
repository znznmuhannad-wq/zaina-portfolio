import html from '@/components/markup/packaging-projects';

export default function PackagingProjects() {
  return (
    <section
      id="packaging-projects"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
