import styles from './slides.module.css';

const CARDS = [
  {
    index: '01',
    title: 'FinTech',
    body: "Banking, investing and rewards apps — Goalsetter's flagship, plus retail loyalty programs. Consumer money, done right.",
  },
  {
    index: '02',
    title: 'EdTech',
    body: 'Classroom platforms and financial-literacy tools — web apps, backend services and deep LMS integrations.',
  },
  {
    index: '03',
    title: 'Full-Stack & AI',
    body: 'Node.js services and internal tooling — including MCP servers and local-LLM agents that accelerate delivery.',
  },
];

const TOOLKIT = [
  'React Native',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'React · Vite · Redux',
  'LTI · LMS',
  'MCP · Local LLM',
  'CI/CD · Bitrise',
];

export function FocusSlide() {
  return (
    <div className={`${styles.slide} ${styles.focusSlide}`}>
      <div className={styles.focusHeader}>
        <div>
          <div className={styles.kicker}>Focus</div>
          <h2 className={styles.focusTitle}>What I build.</h2>
        </div>
        <p className={styles.focusLede}>
          From native mobile apps to full-stack services and AI tooling — three areas where I ship
          real product.
        </p>
      </div>
      <div className={styles.focusCards}>
        {CARDS.map((card) => (
          <div key={card.index} className={styles.focusCard}>
            <div className={styles.focusCardIndex}>{card.index}</div>
            <div className={styles.focusCardTitle}>{card.title}</div>
            <p className={styles.focusCardBody}>{card.body}</p>
          </div>
        ))}
      </div>
      <div className={styles.toolkit}>
        <div className={styles.toolkitLabel}>Toolkit</div>
        <div className={styles.pills}>
          {TOOLKIT.map((tool) => (
            <span key={tool} className={styles.pill}>
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
