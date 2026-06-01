import html from '@/components/markup/video-projects';

export default function VideoProjects() {
  return (
    <section
      id="video-projects"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
