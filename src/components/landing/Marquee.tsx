import styles from './Marquee.module.css';

const ITEMS = [
  'React Native',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Swift · Kotlin',
  'MCP Servers',
  'Local LLM',
  'AI Workflow Engineering',
  'Agentic Automations',
  'AI-Assisted Development',
  'End-to-End Flow Optimization',
  'LTI · LMS',
  'CI/CD',
];

function MarqueeGroup() {
  return (
    <div className={styles.group}>
      {ITEMS.map((item) => (
        <span key={item}>
          {item}
          <span className={styles.sep}> ✦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className={styles.band}>
      <div className={styles.track}>
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}
