'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useLocaleUi } from '@/lib/i18n/locale-context';
import styles from './childhood-polaroids.module.css';

const spring = { duration: 0.72, ease: [0.22, 1, 0.36, 1] } as const;

export function ChildhoodPolaroids() {
  const prefersReducedMotion = useReducedMotion();
  const ui = useLocaleUi();

  const getMotionProps = (delay: number, y: number, rotate: number) => {
    if (prefersReducedMotion) {
      return {
        initial: false,
        whileInView: undefined,
        transition: undefined
      };
    }

    return {
      initial: { opacity: 0, y, rotate: rotate * 1.7, scale: 0.94 },
      whileInView: { opacity: 1, y: 0, rotate, scale: 1 },
      transition: { ...spring, delay },
      viewport: { once: true, amount: 0.34 }
    };
  };

  return (
    <section className={styles.section} aria-labelledby="childhood-title" data-testid="childhood-polaroids">
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartOne}`}>♡</span>
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartTwo}`}>♡</span>
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartThree}`}>♡</span>
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartFour}`}>♡</span>

      <div className={styles.inner}>
        <motion.div
          className={styles.copy}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          transition={spring}
          viewport={{ once: true, amount: 0.55 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        >
          <p className={styles.eyebrow}>{ui.childhoodEyebrow}</p>
          <h2 className={styles.title} id="childhood-title">{ui.childhoodTitle}</h2>
          <p className={styles.lead}>{ui.childhoodLead}</p>
        </motion.div>

        <div className={styles.polaroidScene} aria-label={ui.childhoodAria}>
          <motion.figure className={`${styles.polaroid} ${styles.girl}`} {...getMotionProps(0.1, 28, -7)}>
            <p className={`${styles.thoughtBubble} ${styles.girlBubble}`}>{ui.girlBubble}</p>
            <div className={styles.photoFrame}>
              <Image
                alt={ui.sofiaChildAlt}
                className={styles.photo}
                height={1007}
                src="/photos/sofia-child.png"
                width={1562}
                unoptimized
              />
            </div>
            <figcaption>{ui.sofiaChildCaption}</figcaption>
          </motion.figure>

          <motion.figure className={`${styles.polaroid} ${styles.boy}`} {...getMotionProps(0.28, 36, 6)}>
            <p className={`${styles.thoughtBubble} ${styles.boyBubble}`}>{ui.boyBubble}</p>
            <div className={styles.photoFrame}>
              <Image
                alt={ui.nikitaChildAlt}
                className={styles.photo}
                height={1254}
                src="/photos/nikita-child.png"
                width={1254}
                unoptimized
              />
            </div>
            <figcaption>{ui.nikitaChildCaption}</figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
