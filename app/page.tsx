import Navbar from '@/components/layout/Navbar';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import SocialDesignHero from '@/components/sections/SocialDesignHero';
import WebCta from '@/components/sections/WebCta';
import HighlightedProjects from '@/components/sections/HighlightedProjects';
import Portfolio from '@/components/sections/Portfolio';
import PlasticArt from '@/components/sections/PlasticArt';
import VideoProjects from '@/components/sections/VideoProjects';
import WebProjects from '@/components/sections/WebProjects';
import PackagingProjects from '@/components/sections/PackagingProjects';
import SocialMediaProjects from '@/components/sections/SocialMediaProjects';
import Education from '@/components/sections/Education';
import Contact from '@/components/sections/Contact';
import Modal from '@/components/overlays/Modal';

// Section order is preserved exactly as the legacy <body> to keep the negative
// margins, z-index stacking and anchor navigation identical.
export default function Home() {
  return (
    <>
      <Navbar />
      <MobileMenu />
      <Hero />
      <About />
      <Skills />
      <SocialDesignHero />
      <WebCta />
      <HighlightedProjects />
      <Portfolio />
      <PlasticArt />
      <VideoProjects />
      <WebProjects />
      <PackagingProjects />
      <SocialMediaProjects />
      <Modal />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}
