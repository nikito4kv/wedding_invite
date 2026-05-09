import { alcoholPreferences } from '@/lib/constants/rsvp';
import { escapeTelegramHtml, formatCountRu } from '@/lib/rsvp/formatting';
import type { StoredRsvpSubmission } from '@/lib/rsvp/types';

export interface RsvpAnalyticsSummary {
  totalSubmissions: number;
  attendingSubmissions: number;
  declinedSubmissions: number;
  totalGuests: number;
  soloSubmissions: number;
  plusOneSubmissions: number;
  alcoholCounts: Record<string, number>;
  otherAlcoholNotes: Array<{
    fullName: string;
    note: string;
  }>;
}

export const buildRsvpAnalyticsSummary = (submissions: StoredRsvpSubmission[]): RsvpAnalyticsSummary => {
  const alcoholCounts: Record<string, number> = Object.fromEntries(
    alcoholPreferences.map((preference) => [preference, 0])
  );
  const otherAlcoholNotes: RsvpAnalyticsSummary['otherAlcoholNotes'] = [];

  let attendingSubmissions = 0;
  let declinedSubmissions = 0;
  let totalGuests = 0;
  let soloSubmissions = 0;
  let plusOneSubmissions = 0;

  for (const submission of submissions) {
    if (submission.attendance === 'yes') {
      attendingSubmissions += 1;
      totalGuests += submission.guestCount;

      if (submission.guestMode === 'plusOne') {
        plusOneSubmissions += 1;
      } else {
        soloSubmissions += 1;
      }

      for (const preference of submission.alcoholPreferences) {
        alcoholCounts[preference] = (alcoholCounts[preference] ?? 0) + submission.guestCount;
      }

      if (submission.alcoholPreferences.includes('Другое') && submission.alcoholPreferenceOther) {
        otherAlcoholNotes.push({
          fullName: submission.fullName,
          note: submission.alcoholPreferenceOther
        });
      }
    } else {
      declinedSubmissions += 1;
    }
  }

  return {
    totalSubmissions: submissions.length,
    attendingSubmissions,
    declinedSubmissions,
    totalGuests,
    soloSubmissions,
    plusOneSubmissions,
    alcoholCounts,
    otherAlcoholNotes
  };
};

export const buildRsvpAnalyticsTelegramMessage = (submissions: StoredRsvpSubmission[]): string => {
  const summary = buildRsvpAnalyticsSummary(submissions);
  const sortedAlcoholCounts = Object.entries(summary.alcoholCounts)
    .filter(([, count]) => count > 0)
    .sort(([, leftCount], [, rightCount]) => rightCount - leftCount);

  const alcoholLines = sortedAlcoholCounts.length > 0
    ? sortedAlcoholCounts.map(([label, count]) => `• ${escapeTelegramHtml(label)} — <b>${formatCountRu(count, ['гость', 'гостя', 'гостей'])}</b>`)
    : ['• пока нет предпочтений от гостей, которые придут'];

  const otherLines = summary.otherAlcoholNotes.length > 0
    ? [
        '',
        '📝 <b>Уточнения «Другое»</b>',
        ...summary.otherAlcoholNotes.map(
          (item) => `• ${escapeTelegramHtml(item.fullName)}: ${escapeTelegramHtml(item.note)}`
        )
      ]
    : [];

  return [
    '📊 <b>Сводка RSVP</b>',
    '',
    `🧾 Заявок всего: <b>${formatCountRu(summary.totalSubmissions, ['заявка', 'заявки', 'заявок'])}</b>`,
    `✅ Придут: <b>${formatCountRu(summary.attendingSubmissions, ['заявка', 'заявки', 'заявок'])}</b>`,
    `👥 Гостей ожидаем: <b>${formatCountRu(summary.totalGuests, ['гость', 'гостя', 'гостей'])}</b>`,
    `🙋 Одни: <b>${formatCountRu(summary.soloSubmissions, ['заявка', 'заявки', 'заявок'])}</b>`,
    `➕ С парой: <b>${formatCountRu(summary.plusOneSubmissions, ['заявка', 'заявки', 'заявок'])}</b>`,
    `❌ Не смогут: <b>${formatCountRu(summary.declinedSubmissions, ['заявка', 'заявки', 'заявок'])}</b>`,
    '',
    '🍷 <b>Напитки среди гостей, которые придут</b>',
    ...alcoholLines,
    ...otherLines
  ].join('\n');
};
