'use client';

import { useInviteContent } from '@/lib/i18n/locale-context';
import styles from './guest-chat-section.module.css';

export function GuestChatSection() {
  const { chat } = useInviteContent();

  return (
    <section className={styles.section} aria-labelledby="guest-chat-title">
      <div className="content-frame">
        <div className={`surface-panel ${styles.panel}`}>
          <h2 id="guest-chat-title" className={styles.title}>
            {chat.title}
          </h2>

          <p className={styles.description}>{chat.description}</p>

          <a
            data-testid="telegram-chat-link"
            className={styles.chatLink}
            href={chat.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={chat.label}
          >
            {chat.label}
          </a>
        </div>
      </div>
    </section>
  );
}
