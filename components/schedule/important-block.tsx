'use client';

import { useInviteContent, useLocaleUi } from '@/lib/i18n/locale-context';
import styles from './important-block.module.css';

export function ImportantBlock() {
  const { dressCode } = useInviteContent().partyFormat;
  const ui = useLocaleUi();

  return (
    <section className={styles.panel} aria-labelledby="important-title" data-testid="important-root">
      <p className={styles.eyebrow}>{ui.importantEyebrow}</p>
      <h2 id="important-title" className={styles.title}>
        {dressCode.importantTitle} ✨
      </h2>
      <p className={styles.copy}>{ui.importantIntro}</p>
      <ul className={styles.list}>
        {dressCode.packingList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className={styles.note}>{dressCode.overnightNote} 🏡</p>
    </section>
  );
}
