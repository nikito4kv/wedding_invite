'use client';

import { useInviteContent } from '@/lib/i18n/locale-context';
import styles from './venue-section.module.css';

export function VenueSection() {
  const { venue } = useInviteContent();

  return (
    <section className={styles.section} aria-labelledby="venue-title">
      <div className="content-frame">
        <div className={`surface-panel ${styles.panel}`}>
          <h2 id="venue-title" className={styles.title}>
            {venue.title}
          </h2>

          <p className={styles.venueName}>{venue.label}</p>
          <address className={styles.address}>{venue.address}</address>

          <a
            data-testid="maps-link"
            className={styles.mapsLink}
            href={venue.mapCtaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={venue.mapCtaLabel}
          >
            {venue.mapCtaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
