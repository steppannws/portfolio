import { useTheme } from './hooks/useTheme';
import { useReveal } from './hooks/useReveal';
import { CustomCursor } from './components/shared/CustomCursor';
import { Nav } from './components/landing/Nav';
import { Hero } from './components/landing/Hero';
import { Marquee } from './components/landing/Marquee';
import { WorkSection } from './components/landing/WorkSection';
import { AboutSection } from './components/landing/AboutSection';
import { ContactSection } from './components/landing/ContactSection';
import { Footer } from './components/landing/Footer';

export function App() {
  const [theme, toggleTheme] = useTheme();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      <CustomCursor />
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <Hero theme={theme} />
      <Marquee />
      <WorkSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
