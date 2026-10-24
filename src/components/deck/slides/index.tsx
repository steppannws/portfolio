import type { ReactElement } from 'react';
import { CoverSlide } from './CoverSlide';
import { AboutSlide } from './AboutSlide';
import { FocusSlide } from './FocusSlide';
import { DividerSlide } from './DividerSlide';
import { ProjectSlide } from './ProjectSlide';
import { PROJECT_SLIDES } from './projects';
import { ContactSlide } from './ContactSlide';
import { TydeeMobileSlide } from './TydeeMobileSlide';

export const SLIDES: ReactElement[] = [
  <CoverSlide key="cover" />,
  <AboutSlide key="about" />,
  <FocusSlide key="focus" />,
  <DividerSlide key="divider" />,
  ...PROJECT_SLIDES.flatMap((project, i) => {
    const slide = <ProjectSlide key={`project-${i}`} {...project} />;
    return project.title === 'Tydee' ? [slide, <TydeeMobileSlide key="tydee-mobile" />] : [slide];
  }),
  <ContactSlide key="contact" />,
];
