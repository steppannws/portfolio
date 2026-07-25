import styles from './ContactSection.module.css';

const LINKS = [
  { label: 'LinkedIn ↗', href: 'https://www.linkedin.com/in/stepann/' },
  { label: 'GitHub ↗', href: 'https://github.com/steppannws' },
  { label: 'Stack Overflow ↗', href: 'https://stackoverflow.com/users/6078160/stepan-nikulenko' },
  { label: 'Behance ↗', href: 'https://www.behance.net/stepan' },
];

export function ContactSection() {
  return (
    <section id="contact" data-surface="band" className={styles.section}>
      <div className="shell">
        <div data-reveal="1" className="eyebrow">
          <span className="num">03</span>
          Contact
        </div>

        <div className={styles.body}>
          <h2 data-reveal="1" className={`display ${styles.title}`}>
            Let’s build something great together.
          </h2>

          <div data-reveal="1" className={styles.side}>
            <a href="mailto:stepan.nikulenko@gmail.com" className={styles.email}>
              stepan.nikulenko@gmail.com
            </a>
            <ul className={styles.links}>
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener" className={styles.link}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
