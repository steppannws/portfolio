import { FlagshipProject } from './work/FlagshipProject';
import { GoalsetterVisual } from './work/GoalsetterVisual';
import { ClassroomVisual } from './work/ClassroomVisual';
import { TydeeVisual } from './work/TydeeVisual';
import { AceVisual } from './work/AceVisual';
import { WorkIndex } from './work/WorkIndex';
import styles from './WorkSection.module.css';

export function WorkSection() {
  return (
    <section id="work">
      <div data-surface="paper" className={styles.flagships}>
        <div className="shell">
          <header data-reveal="1" className={styles.header}>
            <div className="eyebrow">
              <span className="num">01</span>
              Selected work
            </div>
            <div className={styles.headerRow}>
              <h2 className={`display ${styles.title}`}>Ten projects, fifteen years.</h2>
              <p className={styles.headerNote}>
                Four flagships below — fintech, edtech, a startup of my own — then the archive.
              </p>
            </div>
          </header>

          <FlagshipProject
            index="01"
            years="2021 — 2026"
            kind="FinTech · Flagship"
            title="Goalsetter"
            blurb="Banking and investing for the next generation. Four years on the flagship React Native app — from engineer to technical lead. 100K+ downloads."
            tags={['React Native', 'TypeScript', 'Technical Lead']}
          >
            <GoalsetterVisual />
          </FlagshipProject>

          <FlagshipProject
            index="02"
            years="2025 — 2026"
            kind="EdTech · Full-Stack"
            title="Goalsetter Classroom"
            blurb="Web apps and microservices bringing financial literacy into schools — built with agentic development and AI best practices: AI agents, MCP servers and local-LLM tools across delivery."
            tags={['TypeScript', 'Microservices', 'Agentic Development']}
            flip
            bleed={false}
          >
            <ClassroomVisual />
          </FlagshipProject>

          <FlagshipProject
            index="03"
            years="Startup"
            kind="Co-founder"
            title="Tydee"
            blurb="Multi-tenant platform for cleaning companies — web, admin and mobile. Co-founded and built end to end with agentic development and AI best practices: scheduling, crew clock-in, revenue tracking and client messaging in one place."
            tags={['Node.js', 'React', 'React Native', 'Agentic Development']}
            link={{ label: 'tydee.io ↗', href: 'https://www.tydee.io/' }}
            bleed={false}
          >
            <TydeeVisual />
          </FlagshipProject>

          <FlagshipProject
            index="04"
            years="2021"
            kind="Retail · Lead"
            title="Ace Hardware Rewards"
            blurb="Rewards app built on the React Native starter I architected — performance profiling, analytics, engineering oversight."
            tags={['React Native', 'Performance', 'Analytics']}
            flip
          >
            <AceVisual />
          </FlagshipProject>
        </div>
      </div>

      <div data-surface="band" className={styles.archive}>
        <div className="shell">
          <header data-reveal="1" className={styles.archiveHeader}>
            <div className="eyebrow">Archive</div>
            <p className={styles.archiveNote}>2010 — 2021 · six earlier products and games</p>
          </header>
          <WorkIndex />
        </div>
      </div>
    </section>
  );
}
