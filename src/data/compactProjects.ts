import { asset } from '../lib/asset';

/** Archive projects — rendered as index rows, newest first. */
export interface CompactProject {
  date: string;
  title: string;
  description: string;
  image: { src: string; alt: string };
}

export const COMPACT_PROJECTS: CompactProject[] = [
  {
    date: '2018 — 2021',
    title: 'Club Premier',
    description:
      "Aeromexico's loyalty platform — native SDK bridges (Lotame, SAS CI360, ThreatMetrix).",
    image: { src: asset('assets/image4.png'), alt: 'Club Premier' },
  },
  {
    date: '2017 — 2018',
    title: 'Aeromexico',
    description:
      'Legacy React web migrated to a performant native app — team of 12, tight deadlines.',
    image: { src: asset('assets/image7.png'), alt: 'Aeromexico' },
  },
  {
    date: '2016 — 2017',
    title: 'Humber',
    description: 'Freight and merchants for truck drivers — GSM-network tracking via native SDK.',
    image: { src: asset('assets/image9.png'), alt: 'Humber' },
  },
  {
    date: '2016',
    title: 'Guía Arqui Buenos Aires',
    description: 'Architecture guide to Buenos Aires — Google Maps and a custom media carousel.',
    image: { src: asset('assets/image10.png'), alt: 'Guía Arqui' },
  },
  {
    date: '2013',
    title: 'Carrera Aérea · Disney',
    description: 'Air-racing mini game for Disney — Adobe AIR and ActionScript 3.',
    image: { src: asset('assets/game-carrera.jpg'), alt: 'Carrera Aérea gameplay' },
  },
  {
    date: '2010',
    title: 'Personal Taxi Dakar',
    description: '3D rally game with deep car customization, built on Adobe AIR.',
    image: { src: asset('assets/game-dakar.jpg'), alt: 'Personal Taxi Dakar customization screen' },
  },
];
