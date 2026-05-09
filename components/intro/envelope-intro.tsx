'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useLocaleUi } from '@/lib/i18n/locale-context';
import { ChildhoodPolaroids } from './childhood-polaroids';
import styles from './envelope-intro.module.css';

type EnvelopeIntroProps = {
  children: ReactNode;
};

const motionEase = [0.22, 1, 0.36, 1] as const;

export function EnvelopeIntro({ children }: EnvelopeIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const ui = useLocaleUi();
  const instantDuration = prefersReducedMotion ? 0 : undefined;

  return (
    <div className={styles.experience} data-intro-state="ready">
      <section
        aria-label={ui.envelopeAria}
        className={styles.intro}
        data-testid="envelope-intro-overlay"
      >
        <span aria-hidden="true" className={`${styles.decor} ${styles.decorOne}`}>♡</span>
        <span aria-hidden="true" className={`${styles.decor} ${styles.decorTwo}`}>✦</span>
        <span aria-hidden="true" className={`${styles.decor} ${styles.decorThree}`}>♡</span>

        <div aria-hidden="true" className={styles.glowOne} />
        <div aria-hidden="true" className={styles.glowTwo} />

        <motion.div
          className={styles.titleStage}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: instantDuration ?? 0.9, ease: motionEase }}
        >
          <p className={styles.titleText} data-testid="wedding-title">
            <span className={styles.inviteLine}>
              <span>{ui.envelopeYou} </span>
              <span>{ui.envelopeInvited} </span>
            </span>
            <span className={styles.weddingLine}>{ui.envelopeWedding}</span>
          </p>

          <motion.svg
            aria-hidden="true"
            className={styles.drawnHeart}
            focusable="false"
            viewBox="0 0 120 105"
          >
            <motion.path
              d="M60 94C31 71 13 55 13 35C13 21 24 11 38 11C48 11 56 17 60 27C64 17 72 11 82 11C96 11 107 21 107 35C107 55 89 71 60 94Z"
              fill="none"
              initial={prefersReducedMotion ? false : { opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ delay: instantDuration === 0 ? 0 : 0.42, duration: instantDuration ?? 1.45, ease: motionEase }}
            />
          </motion.svg>

          <p className={styles.details}>{ui.envelopeDetails}</p>
        </motion.div>
      </section>

      <div>
        <ChildhoodPolaroids />
      </div>

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
