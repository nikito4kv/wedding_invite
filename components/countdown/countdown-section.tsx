'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInviteContent } from '@/lib/i18n/locale-context';
import { formatCountdownValue, getCountdownState, type CountdownUnit } from '@/lib/date';
import styles from './countdown-section.module.css';

type CountdownSectionProps = {
  initialNowTimestampMs: number;
};

const countdownValueByUnit = (
  unit: CountdownUnit,
  state: ReturnType<typeof getCountdownState>
): number => {
  switch (unit) {
    case 'days':
      return state.days;
    case 'hours':
      return state.hours;
    case 'minutes':
      return state.minutes;
    case 'seconds':
      return state.seconds;
  }
};

export function CountdownSection({ initialNowTimestampMs }: CountdownSectionProps) {
  const [nowTimestampMs, setNowTimestampMs] = useState(initialNowTimestampMs);
  const { countdown, event } = useInviteContent();

  useEffect(() => {
    const tick = () => {
      setNowTimestampMs(Date.now());
    };

    tick();
    const intervalId = window.setInterval(tick, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const countdownState = useMemo(
    () => getCountdownState(event.utcTimestampMs, nowTimestampMs),
    [event.utcTimestampMs, nowTimestampMs]
  );

  return (
    <section className={styles.panel} aria-labelledby="countdown-title" data-testid="countdown-root">
      <div className={styles.header}>
        <p className={styles.eyebrow}>{countdown.eyebrow}</p>
        <h2 id="countdown-title" className={styles.title}>
          {countdown.title}
        </h2>
      </div>

      <ul className={styles.grid} aria-label={countdown.title}>
        {countdown.units.map((unit) => (
          <li key={unit.id} className={styles.tile}>
            <span className={styles.value}>{formatCountdownValue(countdownValueByUnit(unit.id, countdownState))}</span>
            <span className={styles.label}>{unit.label}</span>
          </li>
        ))}
      </ul>

      <p className={styles.status}>{countdownState.isComplete ? countdown.completionLabel : countdown.intro}</p>
    </section>
  );
}
