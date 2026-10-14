import html from '@/components/markup/branding-projects';

export default function BrandingProjects() {
  return (
    <section
      id="branding-projects"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
