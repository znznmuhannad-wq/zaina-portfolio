import html from '@/components/markup/social-design-hero';

// Note: the legacy markup had a duplicate `aria-label` on this element (invalid
// HTML; the browser used the first). The single valid label below preserves the
// effective rendered behaviour.
export default function SocialDesignHero() {
  return (
    <section
      id="social-design-hero"
      className="smd-section rounded-[3rem] sm:rounded-[4rem] md:rounded-[6rem] lg:rounded-[100px] about-card-shadow mx-4 md:mx-8 my-8 md:my-12 relative z-20"
      role="region"
      aria-label="Social Media Design Portfolio Showcase"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
