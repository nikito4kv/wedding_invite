import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/rsvp/route';

const originalBotToken = process.env.RSVP_TELEGRAM_BOT_TOKEN;
const originalChatId = process.env.RSVP_TELEGRAM_CHAT_ID;

const buildRequest = (body: unknown): Request => {
  return new Request('http://127.0.0.1:3000/api/rsvp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
};

afterEach(() => {
  if (originalBotToken === undefined) {
    delete process.env.RSVP_TELEGRAM_BOT_TOKEN;
  } else {
    process.env.RSVP_TELEGRAM_BOT_TOKEN = originalBotToken;
  }

  if (originalChatId === undefined) {
    delete process.env.RSVP_TELEGRAM_CHAT_ID;
  } else {
    process.env.RSVP_TELEGRAM_CHAT_ID = originalChatId;
  }

  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/rsvp', () => {
  it('returns a typed validation response when the payload is invalid', async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      buildRequest({
        fullName: 'Анна Иванова',
        attendance: 'yes',
        guestMode: 'plusOne',
        plusOneName: '   ',
        alcoholPreferences: []
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        type: 'validation',
        message: 'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.',
        fieldErrors: {
          plusOneName: 'Укажите имя и фамилию вашего гостя.',
          alcoholPreferences: 'Выберите хотя бы один вариант по алкоголю.'
        }
      }
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns a typed upstream error when Telegram rejects the submission', async () => {
    process.env.RSVP_TELEGRAM_BOT_TOKEN = 'bot-token';
    process.env.RSVP_TELEGRAM_CHAT_ID = '-1001234567890';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: false }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      buildRequest({
        fullName: 'Анна Иванова',
        attendance: 'yes',
        guestMode: 'solo',
        alcoholPreferences: ['Белое вино']
      })
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        type: 'telegram',
        message: 'Не удалось отправить RSVP прямо сейчас. Попробуйте ещё раз немного позже.'
      }
    });
    expect(fetchMock).toHaveBeenCalledWith('https://api.telegram.org/botbot-token/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: '-1001234567890',
        text: [
          '💌 <b>Новая RSVP-заявка</b>',
          '',
          '👥 <b>Гостей в заявке: 1 человек</b>',
          '✅ <b>Присутствие:</b> С радостью приду',
          '🙋 <b>Имя:</b> Анна Иванова',
          '🎟 <b>Формат:</b> Приду один / одна',
          '➕ <b>Гость +1:</b> —',
          '🍷 <b>Напитки:</b> Белое вино'
        ].join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  });

  it('submits a valid RSVP to Telegram and returns success', async () => {
    process.env.RSVP_TELEGRAM_BOT_TOKEN = 'bot-token';
    process.env.RSVP_TELEGRAM_CHAT_ID = '-1001234567890';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      buildRequest({
        fullName: 'Анна Иванова',
        attendance: 'no',
        guestMode: 'solo',
        alcoholPreferences: ['Без алкоголя']
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: 'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.'
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('omits plus-one details from the Telegram payload when attendance is no', async () => {
    process.env.RSVP_TELEGRAM_BOT_TOKEN = 'bot-token';
    process.env.RSVP_TELEGRAM_CHAT_ID = '-1001234567890';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      buildRequest({
        fullName: 'Анна Иванова',
        attendance: 'no',
        guestMode: 'plusOne',
        plusOneName: 'Иван Иванов',
        alcoholPreferences: ['Без алкоголя']
      })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith('https://api.telegram.org/botbot-token/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: '-1001234567890',
        text: [
          '💌 <b>Новая RSVP-заявка</b>',
          '',
          '👥 <b>Гостей в заявке: 0 человек</b>',
          '✅ <b>Присутствие:</b> К сожалению, не смогу',
          '🙋 <b>Имя:</b> Анна Иванова',
          '🎟 <b>Формат:</b> Приду с парой',
          '➕ <b>Гость +1:</b> —',
          '🍷 <b>Напитки:</b> Без алкоголя'
        ].join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  });
});
