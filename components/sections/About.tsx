import html from '@/components/markup/about';

export default function About() {
  return (
    <section
      id="about"
      className="fluid-section-py fluid-section-px bg-white rounded-[3rem] sm:rounded-[4rem] md:rounded-[6rem] lg:rounded-[100px] -mt-10 relative z-20 about-card-shadow"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
