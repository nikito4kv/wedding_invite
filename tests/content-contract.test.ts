import { describe, expect, it } from 'vitest';
import { inviteContent } from '@/lib/content';

describe('invite content contract', () => {
  it('exposes required public sections', () => {
    expect(inviteContent).toHaveProperty('couple');
    expect(inviteContent).toHaveProperty('event');
    expect(inviteContent).toHaveProperty('timeline');
    expect(inviteContent).toHaveProperty('venue');
    expect(inviteContent).toHaveProperty('chat');
    expect(inviteContent).toHaveProperty('organizers');
    expect(inviteContent).toHaveProperty('faq');
    expect(inviteContent).toHaveProperty('assets');
    expect(inviteContent).toHaveProperty('rsvp');
  });

  it('keeps FAQ entries for common guest concerns without raw placeholder copy', () => {
    expect(inviteContent.faq.title).toBe('Вопросы');
    expect(inviteContent.faq.items.map((item) => item.id)).toEqual([
      'arrival-transfer',
      'overnight-stay',
      'flowers',
      'gift',
      'pool',
      'wedding-format'
    ]);
    expect(inviteContent.faq.items.every((item) => item.answerPlaceholder.length > 24)).toBe(true);
    expect(inviteContent.faq.items.some((item) => item.answerPlaceholder.includes('PLACEHOLDER'))).toBe(false);
  });

  it('keeps the canonical Georgia datetime', () => {
    expect(inviteContent.event.datetimeIso).toBe('2026-07-14T15:00:00+04:00');
    expect(inviteContent.event.timezone).toBe('Asia/Tbilisi');
    expect(inviteContent.event.utcTimestampMs).toBe(Date.parse('2026-07-14T15:00:00+04:00'));
  });

  it('builds a safe Google Maps destination URL', () => {
    const url = new URL(inviteContent.venue.mapCtaUrl);

    expect(url.origin).toBe('https://www.google.com');
    expect(url.pathname).toBe('/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toBe('Georgia, Kvariati, ul. Ioane Lazi, 27');
  });

  it('keeps exact timeline moments in chronological order', () => {
    expect(inviteContent.timeline).toHaveLength(4);
    expect(inviteContent.timeline.map((item) => item.timeLabel)).toEqual(['15:00', '15:30', '16:30', '00:00']);
    expect(inviteContent.timeline.map((item) => item.id)).toEqual(['welcome', 'ceremony', 'banquet', 'evening-end']);
  });

  it('keeps the audio placeholder centralized for the music control', () => {
    expect(inviteContent.assets.audio).toEqual({
      path: '/music/walks-sebastian-jautschus.mp3',
      title: 'Walks — Sebastian Jautschus'
    });
  });

  it('defines RSVP options with canonical values, conditional plus-one and locked alcohol preferences', () => {
    expect(inviteContent.venue.title).toBe('Локация');
    expect(inviteContent.chat).toMatchObject({
      title: 'Чат гостей',
      description: 'Оперативные обновления по дню свадьбы и ответы на быстрые вопросы.'
    });
    expect(inviteContent.organizers.title).toBe('Организаторы');
    expect(inviteContent.rsvp).toMatchObject({
      sectionTitle: 'Подтвердите, пожалуйста, ваше присутствие',
      successState: {
        eyebrow: 'Ответ получен',
        title: 'Спасибо, мы вас записали'
      },
      failureState: {
        eyebrow: 'Письмо не ушло',
        title: 'Попробуйте отправить форму ещё раз'
      }
    });
    expect(inviteContent.rsvp.attendanceOptions).toEqual([
      { value: 'yes', label: 'С радостью приду' },
      { value: 'no', label: 'К сожалению, не смогу' }
    ]);
    expect(inviteContent.rsvp.guestFormatOptions).toEqual([
      { value: 'solo', label: 'Приду один / одна' },
      { value: 'plusOne', label: 'Приду с парой' }
    ]);
    expect(inviteContent.rsvp.plusOneNameField).toEqual({
      key: 'plusOneName',
      enabledWhen: {
        guestFormatIs: 'plusOne',
        attendanceIs: 'yes'
      },
      placeholder: 'Введите имя и фамилию вашего гостя'
    });
    expect(inviteContent.rsvp.alcoholPreferenceOptions).toEqual([
      'Красное вино',
      'Белое вино',
      'Игристое',
      'Виски',
      'Без алкоголя',
      'Другое'
    ]);
  });
});
