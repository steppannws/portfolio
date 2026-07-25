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
  'Agentic Automation',
  'LTI · LMS',
  'CI/CD',
];

function MarqueeGroup({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <div className={styles.group} aria-hidden={ariaHidden}>
      {ITEMS.map((item, i) => (
        <span key={item} className={i % 2 ? styles.itemOutline : styles.item}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div data-surface="band" className={styles.band}>
      <div className={styles.track}>
        <MarqueeGroup />
        <MarqueeGroup aria-hidden />
      </div>
    </div>
  );
}
