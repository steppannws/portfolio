import type { ReactElement } from 'react';
import { CoverSlide } from './CoverSlide';
import { AboutSlide } from './AboutSlide';
import { FocusSlide } from './FocusSlide';
import { DividerSlide } from './DividerSlide';
import { ProjectSlide } from './ProjectSlide';
import { PROJECT_SLIDES } from './projects';
import { ContactSlide } from './ContactSlide';

export interface SlideEntry {
  label: string;
  element: ReactElement;
}

const PROJECT_LABELS = [
  'Goalsetter',
  'Classroom',
  'Tydee',
  'Ace Hardware',
  'Club Premier',
  'Aeromexico',
  'Guía Arqui',
  'Humber',
  'Carrera Aérea',
  'Dakar',
];

export const SLIDES: SlideEntry[] = [
  { label: 'Cover', element: <CoverSlide /> },
  { label: 'About', element: <AboutSlide /> },
  { label: 'Focus', element: <FocusSlide /> },
  { label: 'Selected Work', element: <DividerSlide /> },
  ...PROJECT_SLIDES.map((project, i) => ({
    label: PROJECT_LABELS[i],
    element: <ProjectSlide {...project} />,
  })),
  { label: 'Contact', element: <ContactSlide /> },
];
