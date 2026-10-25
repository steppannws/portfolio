import type { ProjectSlideProps } from './ProjectSlide';
import styles from './slides.module.css';
import { asset } from '../../../lib/asset';

export const PROJECT_SLIDES: ProjectSlideProps[] = [
  {
    date: '2021 — 2026',
    role: 'Mobile Engineer → Technical Lead',
    title: 'Goalsetter',
    description:
      'The flagship React Native banking & investing app teaching the next generation to save, invest and learn — where I grew from engineer to technical lead over four years.',
    points: [
      '4+ years on the flagship fintech app — 100K+ downloads across iOS & Android',
      'Progressed Mobile Engineer → Technical Lead: set code standards, mentored, led reviews',
      'Native modules & SDK integrations in Swift/Objective-C and Kotlin/Java',
      'Integrated server-side APIs; CI/CD on Bitrise & App Center; Jest test coverage',
    ],
    tags: ['React Native', 'TypeScript', 'Redux', 'Native Modules', 'Bitrise', 'Jest'],
    media: (
      <>
        <img
          src={asset('assets/gs1.jpg')}
          alt="Goalsetter dashboard"
          className={`${styles.mediaImageThird} ${styles.raiseSlight}`}
        />
        <img
          src={asset('assets/gs3.jpg')}
          alt="Goalsetter investing"
          className={styles.mediaImageThird}
        />
        <img
          src={asset('assets/gs4.jpg')}
          alt="Goalsetter goals"
          className={`${styles.mediaImageThird} ${styles.dropSlight}`}
        />
      </>
    ),
  },
  {
    date: '2025 — 2026',
    role: 'Full-Stack Engineer',
    title: (
      <>
        Goalsetter
        <br />
        Classroom
      </>
    ),
    description:
      "Goalsetter's new EdTech platform — web apps and backend microservices bringing financial literacy into the classroom.",
    points: [
      'Web apps & backend microservices in Node.js, TypeScript & PostgreSQL',
      'RESTful APIs architected for scalability, performance & maintainability',
      'Frontend in React, Vite, Redux & styled-components',
      'AI-augmented delivery — Claude Code & Cursor, plus MCP servers and local-LLM internal tools',
    ],
    tags: ['Node.js', 'PostgreSQL', 'React · Vite · Redux', 'REST APIs'],
    media: (
      <div className={styles.mediaColumn}>
        <img
          src={asset('assets/classroom-hero.webp')}
          alt="Goalsetter Classroom student app on laptop and phone"
          className={styles.mediaImage}
        />
        <img
          src={asset('assets/classroom-dashboard.webp')}
          alt="Goalsetter Classroom educator dashboard"
          className={styles.mediaImage}
        />
      </div>
    ),
  },
  {
    date: 'Startup',
    role: 'Co-founder · Full-Stack',
    title: 'Tydee',
    description:
      'A startup I co-founded — a multi-tenant platform that helps cleaning companies manage their work, employees and clients.',
    points: [
      'Multi-tenant SaaS across three surfaces — customer web, admin console & mobile app',
      'Manage jobs, scheduling, teams and client relationships in one place',
      'Designed and built end to end as co-founder & full-stack engineer',
    ],
    tags: ['Multi-Tenant SaaS', 'Web · Admin · Mobile', 'tydee.io'],
    media: (
      <div className={styles.mediaColumn}>
        <img
          src={asset('assets/tydee-web.jpg')}
          alt="Tydee customer website"
          className={styles.mediaImage}
        />
        <img
          src={asset('assets/tydee-admin.jpg')}
          alt="Tydee admin console calendar"
          className={styles.mediaImage}
        />
      </div>
    ),
  },
  {
    date: '2021',
    role: 'Lead · Oversight',
    title: (
      <>
        Ace Hardware
        <br />
        Rewards
      </>
    ),
    description:
      'A rewards app built on the React Native starter I architected in 2019 — then hardened for scale and speed.',
    points: [
      'Oversaw the project end to end',
      'Performance improvements & re-render profiling',
      'Refined gradient rendering solutions',
      'Built the analytics tracking system',
    ],
    tags: ['React Native', 'Performance', 'Analytics'],
    media: (
      <img
        src={asset('assets/image8.jpg')}
        alt="Ace Hardware Rewards screens"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2018 — 2021',
    role: 'Aeromexico Loyalty · Flagship',
    title: 'Club Premier',
    description:
      "Aeromexico's loyalty platform, with deep native SDK integration bridged cleanly into React Native.",
    points: [
      'Native SDK bridges — Lotame DMP, SAS CI360, ThreatMetrix',
      'Built an RN bridge to drive UI rendered by the native SDKs',
      'Barcode scanner auto-filling forms from Aeromexico tickets',
      'Dynamic form builder from partner requirements · Bitrise CI · Lottie',
    ],
    tags: ['React Native', 'Native Bridges', 'SAS CI360', 'Lotame', 'ThreatMetrix', 'Bitrise'],
    media: (
      <>
        <img
          src={asset('assets/image2.webp')}
          alt="Club Premier screen"
          className={`${styles.mediaImage} ${styles.raiseSlight}`}
          style={{ width: '44%' }}
        />
        <img
          src={asset('assets/image4.webp')}
          alt="Club Premier screen"
          className={`${styles.mediaImage} ${styles.dropSlight}`}
          style={{ width: '44%' }}
        />
      </>
    ),
  },
  {
    date: '2017 — 2018',
    role: 'Mobile Engineer · Team of 12',
    title: 'Aeromexico',
    description:
      'Migrating a legacy React web codebase into a performant native app — against the clock.',
    points: [
      'Ported a legacy React web UI into React Native',
      'UI animations & performance enhancement',
      'Collaborated across a 12-developer team',
      'Shipped under demanding deadlines',
    ],
    tags: ['React Native', 'Web → Native Migration', 'Animations'],
    media: (
      <img
        src={asset('assets/image7.webp')}
        alt="Aeromexico app screens"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2016',
    role: 'Mobile Engineer',
    title: (
      <>
        Guía Arqui
        <br />
        Buenos Aires
      </>
    ),
    description: 'An architecture guide to Buenos Aires — maps and rich media, in your pocket.',
    points: [
      'Google Maps integration for site discovery',
      'Custom image carousel for architectural media',
    ],
    tags: ['React Native', 'Google Maps'],
    media: (
      <img
        src={asset('assets/image10.webp')}
        alt="Guía Arqui Buenos Aires screens"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2016 — 2017',
    role: 'Mobile Engineer',
    title: 'Humber',
    description:
      'Helping truck drivers find merchants and freight between destinations — with precise, network-based tracking.',
    points: [
      'Native SDK for precise tracking over GSM network technology',
      'Google Maps for routing between destinations',
      'Trip tracking with added driver benefits',
    ],
    tags: ['React Native', 'Native SDK', 'Google Maps'],
    media: (
      <img
        src={asset('assets/image9.webp')}
        alt="Humber app screens"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2013',
    role: 'Game Developer · Disney',
    title: 'Carrera Aérea',
    description:
      'An air-racing mini game built for Disney — 3D gameplay delivered with Adobe AIR, back when cross-platform game tech was still young.',
    points: [
      '3D air-race gameplay — altimeter, lives, collectibles and score HUD',
      'Built with Adobe AIR & ActionScript 3',
      'Shipped for Disney in 2013, ahead of the cross-platform wave',
    ],
    tags: ['Adobe AIR', 'ActionScript 3', 'Game Dev'],
    media: (
      <img
        src={asset('assets/game-carrera.jpg')}
        alt="Carrera Aérea gameplay"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2010',
    role: 'Game Developer',
    title: (
      <>
        Personal Taxi
        <br />
        Dakar
      </>
    ),
    description:
      'A 3D Dakar rally game with deep vehicle customization — built in 2010, when Adobe AIR made cross-platform 3D games a novelty.',
    points: [
      'Full 3D vehicle customization — paint, body, wheels, accessories, spoilers',
      'Adobe AIR & ActionScript 3 — cutting-edge cross-platform tech at the time',
      'Complete game experience designed and programmed end to end',
    ],
    tags: ['Adobe AIR', 'ActionScript 3', '3D'],
    media: (
      <img
        src={asset('assets/game-dakar.jpg')}
        alt="Personal Taxi Dakar customization screen"
        className={styles.mediaImage}
      />
    ),
  },
];
