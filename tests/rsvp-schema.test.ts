import { describe, expect, it } from 'vitest';
import { buildTelegramMessage, buildTelegramSendMessagePayload, validateCanonicalRsvpPayload } from '@/lib/rsvp';
import type { CanonicalRsvpPayload } from '@/lib/rsvp';

describe('RSVP schema and Telegram payload builder', () => {
  it('normalizes a valid canonical RSVP payload', () => {
    const result = validateCanonicalRsvpPayload({
      fullName: '  Анна Иванова  ',
      attendance: 'yes',
      guestMode: 'plusOne',
      plusOneName: '  Иван Иванов  ',
      alcoholPreferences: ['Белое вино', 'Игристое']
    });

    expect(result).toEqual({
      success: true,
      data: {
        fullName: 'Анна Иванова',
        attendance: 'yes',
        guestMode: 'plusOne',
        plusOneName: 'Иван Иванов',
        alcoholPreferences: ['Белое вино', 'Игристое']
      }
    });
  });

  it('requires a plus-one name only when guestMode is plusOne', () => {
    const invalidPlusOne = validateCanonicalRsvpPayload({
      fullName: 'Анна Иванова',
      attendance: 'yes',
      guestMode: 'plusOne',
      plusOneName: '   ',
      alcoholPreferences: ['Белое вино']
    });

    const validSolo = validateCanonicalRsvpPayload({
      fullName: 'Анна Иванова',
      attendance: 'yes',
      guestMode: 'solo',
      alcoholPreferences: ['Белое вино']
    });

    expect(invalidPlusOne).toEqual({
      success: false,
      error: {
        type: 'validation',
        message: 'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.',
        fieldErrors: {
          plusOneName: 'Укажите имя и фамилию вашего гостя.'
        }
      }
    });
    expect(validSolo).toEqual({
      success: true,
      data: {
        fullName: 'Анна Иванова',
        attendance: 'yes',
        guestMode: 'solo',
        plusOneName: undefined,
        alcoholPreferences: ['Белое вино']
      }
    });
  });

  it('does not require or preserve a plus-one name when attendance is no', () => {
    const result = validateCanonicalRsvpPayload({
      fullName: '  Анна Иванова  ',
      attendance: 'no',
      guestMode: 'plusOne',
      plusOneName: '  Иван Иванов  ',
      alcoholPreferences: ['Без алкоголя']
    });

    expect(result).toEqual({
      success: true,
      data: {
        fullName: 'Анна Иванова',
        attendance: 'no',
        guestMode: 'plusOne',
        plusOneName: undefined,
        alcoholPreferences: ['Без алкоголя']
      }
    });

    if (result.success) {
      expect(buildTelegramMessage(result.data)).toContain('Гость +1:</b> —');
    }
  });

  it('rejects empty and invalid alcohol preferences', () => {
    const emptySelection = validateCanonicalRsvpPayload({
      fullName: 'Анна Иванова',
      attendance: 'yes',
      guestMode: 'solo',
      alcoholPreferences: []
    });

    const invalidSelection = validateCanonicalRsvpPayload({
      fullName: 'Анна Иванова',
      attendance: 'yes',
      guestMode: 'solo',
      alcoholPreferences: ['Шампанское']
    });

    expect(emptySelection).toEqual({
      success: false,
      error: {
        type: 'validation',
        message: 'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.',
        fieldErrors: {
          alcoholPreferences: 'Выберите хотя бы один вариант по алкоголю.'
        }
      }
    });
    expect(invalidSelection).toEqual({
      success: false,
      error: {
        type: 'validation',
        message: 'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.',
        fieldErrors: {
          alcoholPreferences: 'Выберите варианты только из предложенного списка.'
        }
      }
    });
  });

  it('builds a centralized Telegram payload from the canonical RSVP data', () => {
    const payload: CanonicalRsvpPayload = {
      fullName: 'Анна Иванова',
      attendance: 'yes',
      guestMode: 'plusOne',
      plusOneName: 'Иван Иванов',
      alcoholPreferences: ['Белое вино', 'Игристое']
    };

    expect(buildTelegramMessage(payload)).toBe(
      [
        '💌 <b>Новая RSVP-заявка</b>',
        '',
        '👥 <b>Гостей в заявке: 2 человека</b>',
        '✅ <b>Присутствие:</b> С радостью приду',
        '🙋 <b>Имя:</b> Анна Иванова',
        '🎟 <b>Формат:</b> Приду с парой',
        '➕ <b>Гость +1:</b> Иван Иванов',
        '🍷 <b>Напитки:</b> Белое вино, Игристое'
      ].join('\n')
    );

    expect(buildTelegramSendMessagePayload(payload, { chatId: '-1001234567890' })).toEqual({
      chat_id: '-1001234567890',
      text: buildTelegramMessage(payload),
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  });
});
