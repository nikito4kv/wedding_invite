import { attendanceOptions, guestFormatOptions } from '@/lib/constants/rsvp';
import { escapeTelegramHtml, formatCountRu } from '@/lib/rsvp/formatting';
import { getRsvpGuestCount } from '@/lib/rsvp/storage';
import type { CanonicalRsvpPayload, TelegramErrorResponse, TelegramSendMessagePayload } from '@/lib/rsvp/types';

const telegramErrorMessage = 'Не удалось отправить RSVP прямо сейчас. Попробуйте ещё раз немного позже.';

const attendanceLabels = new Map(attendanceOptions.map((option) => [option.value, option.label]));
const guestModeLabels = new Map(guestFormatOptions.map((option) => [option.value, option.label]));

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface SendTelegramRsvpOptions {
  config?: TelegramConfig;
  fetchImplementation?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}

export type SendTelegramRsvpResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: 500 | 502;
      error: TelegramErrorResponse['error'];
    };

const buildLabel = (label: string | undefined, fallback: string): string => label ?? fallback;

export const getTelegramConfigFromEnv = (env: NodeJS.ProcessEnv = process.env): TelegramConfig | null => {
  const botToken = env.RSVP_TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.RSVP_TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return null;
  }

  return {
    botToken,
    chatId
  };
};

export const buildTelegramMessage = (payload: CanonicalRsvpPayload): string => {
  const attendanceLabel = buildLabel(attendanceLabels.get(payload.attendance), payload.attendance);
  const guestModeLabel = buildLabel(guestModeLabels.get(payload.guestMode), payload.guestMode);
  const guestCount = getRsvpGuestCount(payload);
  const isAttending = payload.attendance === 'yes';
  const plusOneLabel =
    isAttending && payload.guestMode === 'plusOne' && payload.plusOneName
      ? escapeTelegramHtml(payload.plusOneName)
      : '—';
  const drinksLabel = payload.alcoholPreferences.map(escapeTelegramHtml).join(', ');

  const lines = [
    '💌 <b>Новая RSVP-заявка</b>',
    '',
    `👥 <b>Гостей в заявке: ${formatCountRu(guestCount, ['человек', 'человека', 'человек'])}</b>`,
    `✅ <b>Присутствие:</b> ${escapeTelegramHtml(attendanceLabel)}`,
    `🙋 <b>Имя:</b> ${escapeTelegramHtml(payload.fullName)}`,
    `🎟 <b>Формат:</b> ${escapeTelegramHtml(guestModeLabel)}`,
    `➕ <b>Гость +1:</b> ${plusOneLabel}`,
    `🍷 <b>Напитки:</b> ${drinksLabel}`
  ];

  if (payload.alcoholPreferences.includes('Другое') && payload.alcoholPreferenceOther) {
    lines.push(`📝 <b>Другое по напиткам:</b> ${escapeTelegramHtml(payload.alcoholPreferenceOther)}`);
  }

  return lines.join('\n');
};

export const buildTelegramSendMessagePayload = (
  payload: CanonicalRsvpPayload,
  config: Pick<TelegramConfig, 'chatId'>
): TelegramSendMessagePayload => ({
  chat_id: config.chatId,
  text: buildTelegramMessage(payload),
  parse_mode: 'HTML',
  disable_web_page_preview: true
});

export const sendTelegramText = async (
  botToken: string,
  chatId: string,
  text: string,
  fetchImplementation: typeof fetch = fetch
): Promise<Response> => {
  return fetchImplementation(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    } satisfies TelegramSendMessagePayload)
  });
};

export const sendTelegramRsvp = async (
  payload: CanonicalRsvpPayload,
  options: SendTelegramRsvpOptions = {}
): Promise<SendTelegramRsvpResult> => {
  const config = options.config ?? getTelegramConfigFromEnv(options.env);

  if (!config) {
    return {
      ok: false,
      status: 500,
      error: {
        type: 'telegram',
        message: telegramErrorMessage
      }
    };
  }

  const fetchImplementation = options.fetchImplementation ?? fetch;

  try {
    const response = await sendTelegramText(
      config.botToken,
      config.chatId,
      buildTelegramMessage(payload),
      fetchImplementation
    );

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: {
          type: 'telegram',
          message: telegramErrorMessage
        }
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 502,
      error: {
        type: 'telegram',
        message: telegramErrorMessage
      }
    };
  }
};
