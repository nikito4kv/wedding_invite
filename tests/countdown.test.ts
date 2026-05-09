import { describe, expect, it } from 'vitest';
import { inviteContent } from '@/lib/content';
import { formatCountdownValue, getCountdownState } from '@/lib/date';

const eventTimestampMs = inviteContent.event.utcTimestampMs;

describe('countdown utilities', () => {
  it('decomposes a fixed Georgia-time interval into countdown units', () => {
    const nowTimestampMs = Date.parse('2026-07-12T11:56:54+04:00');

    expect(getCountdownState(eventTimestampMs, nowTimestampMs)).toEqual({
      totalMs: (((2 * 24 + 3) * 60 + 3) * 60 + 6) * 1_000,
      days: 2,
      hours: 3,
      minutes: 3,
      seconds: 6,
      isComplete: false
    });
  });

  it('returns the same countdown for the same instant expressed in different offsets', () => {
    const georgiaNowTimestampMs = Date.parse('2026-07-13T14:00:00+04:00');
    const sameInstantDifferentOffsetTimestampMs = Date.parse('2026-07-13T07:00:00-03:00');

    expect(getCountdownState(eventTimestampMs, georgiaNowTimestampMs)).toEqual({
      totalMs: 25 * 60 * 60 * 1_000,
      days: 1,
      hours: 1,
      minutes: 0,
      seconds: 0,
      isComplete: false
    });
    expect(getCountdownState(eventTimestampMs, georgiaNowTimestampMs)).toEqual(
      getCountdownState(eventTimestampMs, sameInstantDifferentOffsetTimestampMs)
    );
  });

  it('clamps the countdown to zero at and after the canonical event instant', () => {
    const atEventTimestampMs = Date.parse('2026-07-14T15:00:00+04:00');
    const afterEventTimestampMs = Date.parse('2026-07-14T15:00:45+04:00');

    const completeState = {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true
    };

    expect(getCountdownState(eventTimestampMs, atEventTimestampMs)).toEqual(completeState);
    expect(getCountdownState(eventTimestampMs, afterEventTimestampMs)).toEqual(completeState);
  });

  it('formats values with leading zeroes without truncating longer numbers', () => {
    expect(formatCountdownValue(4)).toBe('04');
    expect(formatCountdownValue(12)).toBe('12');
    expect(formatCountdownValue(123)).toBe('123');
  });
});
