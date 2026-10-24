import { asset } from '../lib/asset';

/** Archive projects — rendered as index rows, newest first. */
export interface CompactProject {
  date: string;
  title: string;
  description: string;
  image: string;
}

export const COMPACT_PROJECTS: CompactProject[] = [
  {
    date: '2018 — 2021',
    title: 'Club Premier',
    description:
      "Aeromexico's loyalty platform — native SDK bridges (Lotame, SAS CI360, ThreatMetrix).",
    image: asset('assets/image4.png'),
  },
  {
    date: '2017 — 2018',
    title: 'Aeromexico',
    description:
      'Legacy React web migrated to a performant native app — team of 12, tight deadlines.',
    image: asset('assets/image7.png'),
  },
  {
    date: '2016 — 2017',
    title: 'Humber',
    description: 'Freight and merchants for truck drivers — GSM-network tracking via native SDK.',
    image: asset('assets/image9.png'),
  },
  {
    date: '2016',
    title: 'Guía Arqui Buenos Aires',
    description: 'Architecture guide to Buenos Aires — Google Maps and a custom media carousel.',
    image: asset('assets/image10.png'),
  },
  {
    date: '2013',
    title: 'Carrera Aérea · Disney',
    description: 'Air-racing mini game for Disney — Adobe AIR and ActionScript 3.',
    image: asset('assets/game-carrera.jpg'),
  },
  {
    date: '2010',
    title: 'Personal Taxi Dakar',
    description: '3D rally game with deep car customization, built on Adobe AIR.',
    image: asset('assets/game-dakar.jpg'),
  },
];
