import html from '@/components/markup/social-media-projects';

export default function SocialMediaProjects() {
  return (
    <section
      id="social-media-projects"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
