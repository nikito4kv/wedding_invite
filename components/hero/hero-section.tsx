'use client';

import Image from 'next/image';
import { useInviteContent, useLocaleUi } from '@/lib/i18n/locale-context';
import styles from './hero-section.module.css';

export function HeroSection() {
  const { couple, hero } = useInviteContent();
  const ui = useLocaleUi();
  const heroPhotos = [
    {
      id: 'couple',
      src: '/photos/couple-together.jpeg',
      alt: ui.heroCoupleAlt,
      caption: ui.heroCoupleCaption
    },
    {
      id: 'venue',
      src: '/photos/venue-location.jpeg',
      alt: ui.heroVenueAlt,
      caption: ui.heroVenueCaption
    }
  ] as const;

  return (
    <header className={styles.section} aria-labelledby="hero-title" data-testid="hero-region">
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartOne}`}>♡</span>
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartTwo}`}>♡</span>
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartThree}`}>♡</span>
      <span aria-hidden="true" className={`${styles.floatingHeart} ${styles.heartFour}`}>♡</span>

      <div className={styles.inner}>
        <div className={styles.copyBlock} data-testid="hero-root">
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>
            <span>{couple.partnerOne}</span>
            <span className={styles.ampersand}>&amp;</span>
            <span>{couple.partnerTwo}</span>
          </h1>
          <p className={styles.subtitle}>{hero.subtitle}</p>
          <p className={styles.lead}>{hero.lead}</p>
        </div>

        <div className={styles.photoRail} aria-label={ui.heroPhotoAria}>
          {heroPhotos.map((photo, index) => (
            <figure key={photo.id} className={styles.photoCard}>
              <div className={styles.photoFrame} data-testid={`hero-photo-${photo.id}`}>
                <Image
                  alt={photo.alt}
                  className={styles.photoImage}
                  fill
                  loading={index === 0 ? undefined : 'lazy'}
                  priority={index === 0}
                  sizes="(max-width: 48rem) calc(100vw - 3rem), (max-width: 80rem) calc(50vw - 4rem), 23rem"
                  src={photo.src}
                  unoptimized
                />
              </div>
              <figcaption className={styles.caption}>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </header>
  );
}
