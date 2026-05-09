export type CountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds';

export interface CountdownState {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const formatCountdownValue = (value: number): string => value.toString().padStart(2, '0');

export const getCountdownState = (targetTimestampMs: number, nowTimestampMs: number): CountdownState => {
  const totalMs = Math.max(targetTimestampMs - nowTimestampMs, 0);
  const days = Math.floor(totalMs / DAY_MS);
  const hours = Math.floor((totalMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((totalMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((totalMs % MINUTE_MS) / SECOND_MS);

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isComplete: totalMs === 0
  };
};
