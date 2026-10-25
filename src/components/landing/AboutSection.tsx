import styles from './AboutSection.module.css';

const CAPABILITIES = [
  {
    title: 'AI & agentic development',
    body: 'Designing and shipping AI agents end to end — LLM integration, tool use, MCP servers, context engineering and agentic workflows in real delivery.',
  },
  {
    title: 'Mobile development',
    body: 'React Native at scale, native Swift and Kotlin bridges, release pipelines and performance work.',
  },
  {
    title: 'Backend development',
    body: 'Node.js services, PostgreSQL, microservices and the integrations that hold products together.',
  },
  {
    title: 'Technical leadership',
    body: 'Teams of up to twelve engineers — code standards, mentoring, turning requirements into shipped scope.',
  },
];

const STATS = [
  { value: '15+', label: 'Years hands-on' },
  { value: '20+', label: 'Engineers led' },
  { value: '10', label: 'Products on this page' },
  { value: '∞', label: 'Shipped — lost count', accent: true },
];

export function AboutSection() {
  return (
    <section id="about" data-surface="paper" className={styles.section}>
      <div className="shell">
        <div data-reveal="1" className="eyebrow">
          <span className="num">02</span>
          About
        </div>

        <div className={styles.statement}>
          <h2 data-reveal="1" className={`display ${styles.title}`}>
            Hands-on <span className="serif">from</span> code to team.
          </h2>
          <div data-reveal="1" className={styles.prose}>
            <p className={styles.paragraph}>
              It started with the first computer my father brought home — which I took apart, piece
              by piece. Fifteen years later I design and implement AI agents and agentic systems,
              and ship fintech and edtech products end to end — native mobile apps and Node.js
              services included.
            </p>
            <p className={styles.paragraph}>
              As technical lead at Goalsetter and lead developer at MediaMonks I’ve guided teams of
              up to twelve engineers — code standards, mentoring, and turning requirements into
              products that ship.
            </p>
          </div>
        </div>

        <div data-reveal="1" className={styles.capabilities}>
          {CAPABILITIES.map((item) => (
            <div key={item.title} className={styles.capability}>
              <h3 className={styles.capabilityTitle}>{item.title}</h3>
              <p className={styles.capabilityBody}>{item.body}</p>
            </div>
          ))}
        </div>

        <div data-reveal="1" className={styles.stats}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span
                className={
                  stat.accent ? `${styles.statValue} ${styles.statValueAccent}` : styles.statValue
                }
              >
                {stat.value}
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
