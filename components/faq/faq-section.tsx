'use client';

import { useInviteContent } from '@/lib/i18n/locale-context';
import styles from './faq-section.module.css';

export function FaqSection() {
  const { faq } = useInviteContent();

  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <div className="content-frame">
        <div className={`surface-panel ${styles.panel}`}>
          <h2 id="faq-title" className={styles.title}>
            {faq.title}
          </h2>

          <div className={styles.list}>
            {faq.items.map((item) => (
              <article key={item.id} className={styles.item}>
                <h3 className={styles.question}>{item.question}</h3>
                <div className={styles.answerGroup}>
                  {item.answerLines.map((line) => (
                    <p key={line} className={styles.answer}>{line}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
