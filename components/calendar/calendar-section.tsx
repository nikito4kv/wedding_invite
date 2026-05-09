'use client';

import { useInviteContent } from '@/lib/i18n/locale-context';
import styles from './calendar-section.module.css';

export function CalendarSection() {
  const { calendar, event } = useInviteContent();

  return (
    <section className={styles.panel} aria-labelledby="calendar-title" data-testid="calendar-root">
      <div className={styles.header}>
        <p className={styles.eyebrow}>{calendar.eyebrow}</p>
        <h2 id="calendar-title" className={styles.title}>
          {calendar.title}
        </h2>
        <p className={styles.copy}>{calendar.note}</p>
      </div>

      <time className={styles.card} dateTime={event.datetimeIso}>
        <span className={styles.month}>{calendar.monthLabel}</span>
        <span className={styles.heartWrap} aria-hidden="true">
          <svg className={styles.heart} focusable="false" viewBox="0 0 120 105">
            <path d="M60 94C31 71 13 55 13 35C13 21 24 11 38 11C48 11 56 17 60 27C64 17 72 11 82 11C96 11 107 21 107 35C107 55 89 71 60 94Z" />
          </svg>
          <span className={styles.day}>14</span>
        </span>
        <span className={styles.weekday}>{calendar.weekdayLabel}</span>
        <span className={styles.year}>{calendar.yearLabel}</span>
      </time>
    </section>
  );
}
