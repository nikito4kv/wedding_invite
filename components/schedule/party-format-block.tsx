'use client';

import { useInviteContent, useLocaleUi } from '@/lib/i18n/locale-context';
import styles from './party-format-block.module.css';

export function PartyFormatBlock() {
  const { partyFormat } = useInviteContent();
  const ui = useLocaleUi();

  return (
    <div className={styles.stack} data-testid="party-format-root">
      <section className={`${styles.panel} ${styles.formatPanel}`} aria-labelledby="party-format-title">
        <p className={styles.eyebrow}>{partyFormat.eyebrow}</p>
        <h2 id="party-format-title" className={styles.title}>
          {partyFormat.title}
        </h2>
        <p className={styles.copy}>{partyFormat.description}</p>
        <p className={styles.note}>{partyFormat.note}</p>
      </section>

      <section className={`${styles.panel} ${styles.dressPanel}`} aria-labelledby="dress-code-title">
        <p className={styles.eyebrow}>{ui.looksAtmosphere}</p>
        <h2 id="dress-code-title" className={styles.title}>
          {partyFormat.dressCode.title}
        </h2>
        <p className={styles.copy}>{partyFormat.dressCode.intro}</p>

        <div className={styles.lookGrid}>
          {partyFormat.dressCode.groups.map((group) => (
            <div key={group.title} className={styles.lookCard}>
              <p className={styles.lookTitle}>{group.title}</p>
              <p className={styles.lookText}>{group.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.paletteBlock}>
          <p className={styles.lookTitle}>{ui.paletteTitle}</p>
          <ul className={styles.palette} aria-label={ui.paletteAria}>
            {partyFormat.dressCode.palette.map((item) => (
              <li key={item.label} className={styles.paletteItem}>
                <span className={styles.swatch} style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className={styles.paletteNote}>{partyFormat.dressCode.paletteNote}</p>
        </div>

      </section>
    </div>
  );
}
