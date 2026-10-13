import html from '@/components/markup/game';

export default function GameSection() {
  return (
    <section
      id="game-section"
      className="fluid-section-py fluid-section-px relative z-20 hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
