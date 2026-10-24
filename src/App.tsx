import { useReveal } from './hooks/useReveal';
import { Nav } from './components/landing/Nav';
import { Hero } from './components/landing/Hero';
import { Marquee } from './components/landing/Marquee';
import { WorkSection } from './components/landing/WorkSection';
import { AboutSection } from './components/landing/AboutSection';
import { ContactSection } from './components/landing/ContactSection';
import { Footer } from './components/landing/Footer';

export function App() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      {/* dark-only for now: index.html pins data-theme; pass theme + onToggleTheme to restore the toggle */}
      <Nav />
      <Hero />
      <Marquee />
      <WorkSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
