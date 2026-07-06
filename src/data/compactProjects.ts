import { asset } from '../lib/asset';

export interface CompactProject {
  span: number;
  minHeight: number;
  date: string;
  title: string;
  description: string;
  image: { src: string; alt: string };
}

export const COMPACT_PROJECTS: CompactProject[] = [
  {
    span: 6,
    minHeight: 300,
    date: '2018 — 2021',
    title: 'Club Premier',
    description:
      "Aeromexico's loyalty platform — native SDK bridges (Lotame, SAS CI360, ThreatMetrix).",
    image: { src: asset('assets/image4.png'), alt: 'Club Premier' },
  },
  {
    span: 6,
    minHeight: 300,
    date: '2017 — 2018',
    title: 'Aeromexico',
    description:
      'Legacy React web migrated to a performant native app — team of 12, tight deadlines.',
    image: { src: asset('assets/image7.png'), alt: 'Aeromexico' },
  },
  {
    span: 6,
    minHeight: 260,
    date: '2016',
    title: 'Guía Arqui Buenos Aires',
    description: 'Architecture guide to Buenos Aires — Google Maps & custom media carousel.',
    image: { src: asset('assets/image10.png'), alt: 'Guía Arqui' },
  },
  {
    span: 6,
    minHeight: 260,
    date: '2016 — 2017',
    title: 'Humber',
    description:
      'Freight & merchants for truck drivers — precise GSM-network tracking via native SDK.',
    image: { src: asset('assets/image9.png'), alt: 'Humber' },
  },
];
