'use client';

import { useInviteContent } from '@/lib/i18n/locale-context';
import styles from './schedule-section.module.css';

export function ScheduleSection() {
  const { scheduleSection, timeline } = useInviteContent();

  return (
    <section className={styles.panel} aria-labelledby="schedule-title" data-testid="schedule-root">
      <div className={styles.header}>
        <p className={styles.eyebrow}>{scheduleSection.eyebrow}</p>
        <h2 id="schedule-title" className={styles.title}>
          {scheduleSection.title}
        </h2>
        <p className={styles.copy}>{scheduleSection.intro}</p>
      </div>

      <ol className={styles.timeline}>
        {timeline.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.timeWrap}>
              <time className={styles.time}>{item.timeLabel}</time>
            </div>
            <div className={styles.body}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
