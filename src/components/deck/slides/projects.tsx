import type { ProjectSlideProps } from './ProjectSlide';
import styles from './slides.module.css';
import { asset } from '../../../lib/asset';

function Placeholder({ label, phone = false }: { label: string; phone?: boolean }) {
  return (
    <div className={phone ? styles.placeholderPhone : styles.placeholderCol}>
      <span className={styles.placeholderLabel}>{label}</span>
      <span className={styles.placeholderHint}>Drop screenshot</span>
    </div>
  );
}

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
          src={asset('assets/gs1.png')}
          alt="Goalsetter dashboard"
          className={`${styles.mediaImageThird} ${styles.raiseSlight}`}
        />
        <img
          src={asset('assets/gs3.png')}
          alt="Goalsetter investing"
          className={styles.mediaImageThird}
        />
        <img
          src={asset('assets/gs4.png')}
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
      <div className={styles.lmsPanel}>
        <div className={styles.lmsPanelLabel}>LMS Integrations</div>
        <div className={styles.lmsRows}>
          {[
            { name: 'Canvas', tag: 'LMS' },
            { name: 'Brightspace', tag: 'LMS' },
            { name: 'LTI · LTIAAS', tag: 'Standard' },
          ].map((row) => (
            <div key={row.name} className={styles.lmsRow}>
              <span className={styles.lmsRowName}>{row.name}</span>
              <span className={styles.lmsRowTag}>{row.tag}</span>
            </div>
          ))}
        </div>
        <div className={styles.lmsArrow}>↓</div>
        <div className={styles.lmsTarget}>Goalsetter Classroom</div>
        <div className={styles.lmsDividerLine} />
        <div className={styles.lmsPanelLabel}>AI-Augmented Delivery</div>
        <div className={styles.pills}>
          {['Claude Code', 'Cursor', 'MCP Servers', 'Local-LLM Tools'].map((tool) => (
            <span key={tool} className={styles.pill}>
              {tool}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    date: 'Startup',
    role: 'Founder · Full-Stack',
    title: 'Tydee',
    description:
      'My own startup — a multi-tenant platform that helps cleaning companies manage their work, employees and clients.',
    points: [
      'Multi-tenant SaaS across three surfaces — customer web, admin console & mobile app',
      'Manage jobs, scheduling, teams and client relationships in one place',
      'Designed and built end to end as founder & full-stack engineer',
    ],
    tags: ['Multi-Tenant SaaS', 'Web · Admin · Mobile', 'tydee.io'],
    media: (
      <>
        <Placeholder label="Web" />
        <Placeholder label="Admin" />
        <Placeholder label="Mobile" phone />
      </>
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
        src={asset('assets/image8.png')}
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
          src={asset('assets/image2.png')}
          alt="Club Premier screen"
          className={`${styles.mediaImage} ${styles.raiseSlight}`}
          style={{ width: '44%' }}
        />
        <img
          src={asset('assets/image4.png')}
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
        src={asset('assets/image7.png')}
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
        src={asset('assets/image10.png')}
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
        src={asset('assets/image9.png')}
        alt="Humber app screens"
        className={styles.mediaImage}
      />
    ),
  },
];
