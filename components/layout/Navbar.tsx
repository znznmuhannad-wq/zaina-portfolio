import html from '@/components/markup/navbar';

export default function Navbar() {
  return (
    <nav
      className="fixed w-full z-50 px-4 md:px-6 py-4 md:py-6 flex justify-between items-center backdrop-blur-md bg-warm_beige/80 transition-all duration-300"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
