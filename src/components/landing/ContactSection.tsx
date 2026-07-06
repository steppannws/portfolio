import styles from './ContactSection.module.css';

const SOCIALS = [
  { label: 'GitHub ↗', href: 'https://github.com/steppannws' },
  { label: 'Stack Overflow ↗', href: 'https://stackoverflow.com/users/6078160/stepan-nikulenko' },
  { label: 'Behance ↗', href: 'https://www.behance.net/stepan' },
];

export function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.glow} />
      <div data-reveal="1" className={styles.content}>
        <div className={styles.eyebrow}>03 — Contact</div>
        <h2 className={styles.title}>
          Let&apos;s build something
          <br />
          great together
          <span className={styles.titleDot}>.</span>
        </h2>
        <div className={styles.ctas}>
          <a href="mailto:stepan.nikulenko@gmail.com" className={`${styles.ctaPrimary} hover-lift`}>
            stepan.nikulenko@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/stepann/"
            target="_blank"
            rel="noopener"
            className={`${styles.ctaSecondary} hover-lift`}
          >
            LinkedIn ↗
          </a>
        </div>
        <div className={styles.socials}>
          {SOCIALS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener"
              className={styles.social}
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
