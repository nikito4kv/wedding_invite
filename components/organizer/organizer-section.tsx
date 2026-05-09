'use client';

import { useInviteContent } from '@/lib/i18n/locale-context';
import styles from './organizer-section.module.css';

export function OrganizerSection() {
  const { organizers } = useInviteContent();
  const contacts = [organizers.primary, organizers.backup];

  return (
    <section className={styles.section} aria-labelledby="organizer-title">
      <div className="content-frame">
        <div className={`surface-panel ${styles.panel}`}>
          <h2 id="organizer-title" className={styles.title}>
            {organizers.title}
          </h2>

          <ul className={styles.list}>
            {contacts.map((contact) => (
              <li key={contact.telegram} className={styles.card}>
                <p className={styles.name}>{contact.role} — {contact.name}</p>
                <a
                  className={styles.telegramLink}
                  href={`https://t.me/${contact.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.telegram}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
