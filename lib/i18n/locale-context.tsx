'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { inviteContentByLocale } from '@/lib/content/invite-content';

export type Locale = keyof typeof inviteContentByLocale;

const localeStorageKey = 'wedding-invite-locale';

const uiByLocale = {
  ru: {
    switcherLabel: 'Переключить язык',
    skipLink: 'Перейти к приглашению',
    mainAria: 'Свадебное приглашение Никиты и Софии',
    detailsTitle: 'Детали нашего дня',
    envelopeAria: 'Титульный лист свадебного приглашения',
    envelopeYou: 'Вы',
    envelopeInvited: 'приглашены',
    envelopeWedding: 'на свадьбу',
    envelopeDetails: '14 июля 2026 • Квариати, Грузия',
    childhoodEyebrow: 'Наша маленькая история',
    childhoodTitle: 'Когда-то мы были маленькими',
    childhoodLead: 'И даже не знали, что однажды встретим друг друга и будем готовиться к самому тёплому дню.',
    childhoodAria: 'Детские фотографии Софии и Никиты',
    girlBubble: 'Интересно, кто будет моим мужем?',
    boyBubble: 'Им буду я!',
    sofiaChildAlt: 'Детское фото Софии',
    nikitaChildAlt: 'Детское фото Никиты',
    sofiaChildCaption: 'маленькая София',
    nikitaChildCaption: 'маленький Никита',
    heroPhotoAria: 'Фотографии пары и места свадьбы',
    heroCoupleAlt: 'Никита и София вместе у моря',
    heroCoupleCaption: 'Мы вместе — там, где начинается наша новая история.',
    heroVenueAlt: 'Локация свадьбы Kvariati Terrace в Грузии',
    heroVenueCaption: 'Kvariati Terrace — место, где мы будем ждать вас у моря.',
    looksAtmosphere: 'Атмосфера образов',
    paletteTitle: 'Цветовая палитра',
    paletteAria: 'Рекомендованная цветовая палитра',
    importantEyebrow: 'Для отдыха после вечера',
    importantIntro: 'Свадьба будет проходить в загородном доме с бассейном, поэтому обязательно возьмите с собой:',
    musicControlAria: 'Управление музыкой',
    musicOn: 'Включить музыку',
    musicOff: 'Выключить музыку',
    musicPlaying: (title: string) => `Сейчас звучит: ${title}.`,
    musicBlocked: 'Браузер заблокировал запуск музыки. Нажмите кнопку звука, чтобы включить мелодию вручную.',
    musicMissing: 'Музыкальный трек появится позже.',
    musicPaused: (title: string) => `Музыка выключена. ${title} можно включить снова вручную.`,
    musicReady: (title: string) => `${title} готова к запуску.`,
    rsvpFallback: 'Не удалось отправить RSVP прямо сейчас. Попробуйте ещё раз немного позже.',
    rsvpSuccessMessage: 'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.',
    fullNameLabel: 'Имя и фамилия',
    fullNamePlaceholder: 'Например, Анна Иванова',
    attendanceLegend: 'Сможете ли вы быть с нами?',
    guestModeLegend: 'Как вы планируете прийти?',
    plusOneLabel: 'Имя и фамилия гостя +1',
    drinksLegend: 'Что вам ближе по напиткам?',
    drinksHelper: 'Можно выбрать несколько вариантов.',
    otherDrinkLabel: 'Уточните другой напиток',
    otherDrinkPlaceholder: 'Например, хочу пиво',
    validation: {
      'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.': 'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.',
      'Не удалось прочитать данные формы. Обновите страницу и попробуйте снова.': 'Не удалось прочитать данные формы. Обновите страницу и попробуйте снова.',
      'Укажите ваше имя и фамилию.': 'Укажите ваше имя и фамилию.',
      'Выберите, сможете ли вы присутствовать.': 'Выберите, сможете ли вы присутствовать.',
      'Выберите, придёте ли вы один / одна или с парой.': 'Выберите, придёте ли вы один / одна или с парой.',
      'Укажите имя и фамилию вашего гостя.': 'Укажите имя и фамилию вашего гостя.',
      'Выберите хотя бы один вариант по алкоголю.': 'Выберите хотя бы один вариант по алкоголю.',
      'Выберите варианты только из предложенного списка.': 'Выберите варианты только из предложенного списка.',
      'Уточните, пожалуйста, какой напиток вам ближе.': 'Уточните, пожалуйста, какой напиток вам ближе.'
    }
  },
  uk: {
    switcherLabel: 'Перемкнути мову',
    skipLink: 'Перейти до запрошення',
    mainAria: 'Весільне запрошення Микити та Софії',
    detailsTitle: 'Деталі нашого дня',
    envelopeAria: 'Титульна сторінка весільного запрошення',
    envelopeYou: 'Ви',
    envelopeInvited: 'запрошені',
    envelopeWedding: 'на весілля',
    envelopeDetails: '14 липня 2026 • Кваріаті, Грузія',
    childhoodEyebrow: 'Наша маленька історія',
    childhoodTitle: 'Колись ми були маленькими',
    childhoodLead: 'І навіть не знали, що одного дня зустрінемо один одного й готуватимемося до найтеплішого дня.',
    childhoodAria: 'Дитячі фотографії Софії та Микити',
    girlBubble: 'Цікаво, хто буде моїм чоловіком?',
    boyBubble: 'Це буду я!',
    sofiaChildAlt: 'Дитяче фото Софії',
    nikitaChildAlt: 'Дитяче фото Микити',
    sofiaChildCaption: 'маленька Софія',
    nikitaChildCaption: 'маленький Микита',
    heroPhotoAria: 'Фотографії пари та місця весілля',
    heroCoupleAlt: 'Микита й Софія разом біля моря',
    heroCoupleCaption: 'Ми разом — там, де починається наша нова історія.',
    heroVenueAlt: 'Локація весілля Kvariati Terrace у Грузії',
    heroVenueCaption: 'Kvariati Terrace — місце, де ми чекатимемо вас біля моря.',
    looksAtmosphere: 'Атмосфера образів',
    paletteTitle: 'Кольорова палітра',
    paletteAria: 'Рекомендована кольорова палітра',
    importantEyebrow: 'Для відпочинку після вечора',
    importantIntro: 'Весілля проходитиме в заміському будинку з басейном, тому обов’язково візьміть із собою:',
    musicControlAria: 'Керування музикою',
    musicOn: 'Увімкнути музику',
    musicOff: 'Вимкнути музику',
    musicPlaying: (title: string) => `Зараз звучить: ${title}.`,
    musicBlocked: 'Браузер заблокував запуск музики. Натисніть кнопку звуку, щоб увімкнути мелодію вручну.',
    musicMissing: 'Музичний трек з’явиться пізніше.',
    musicPaused: (title: string) => `Музику вимкнено. ${title} можна увімкнути знову вручну.`,
    musicReady: (title: string) => `${title} готова до запуску.`,
    rsvpFallback: 'Не вдалося надіслати RSVP просто зараз. Спробуйте ще раз трохи пізніше.',
    rsvpSuccessMessage: 'Дякуємо! Ми отримали вашу відповідь і зв’яжемося, якщо знадобляться деталі.',
    fullNameLabel: 'Ім’я та прізвище',
    fullNamePlaceholder: 'Наприклад, Анна Іванова',
    attendanceLegend: 'Чи зможете ви бути з нами?',
    guestModeLegend: 'Як ви плануєте прийти?',
    plusOneLabel: 'Ім’я та прізвище гостя +1',
    drinksLegend: 'Що вам ближче з напоїв?',
    drinksHelper: 'Можна обрати кілька варіантів.',
    otherDrinkLabel: 'Уточніть інший напій',
    otherDrinkPlaceholder: 'Наприклад, хочу пиво',
    validation: {
      'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.': 'Будь ласка, перевірте заповнення форми й спробуйте ще раз.',
      'Не удалось прочитать данные формы. Обновите страницу и попробуйте снова.': 'Не вдалося прочитати дані форми. Оновіть сторінку й спробуйте знову.',
      'Укажите ваше имя и фамилию.': 'Вкажіть ваше ім’я та прізвище.',
      'Выберите, сможете ли вы присутствовать.': 'Оберіть, чи зможете ви бути присутніми.',
      'Выберите, придёте ли вы один / одна или с парой.': 'Оберіть, чи прийдете ви один / одна або з парою.',
      'Укажите имя и фамилию вашего гостя.': 'Вкажіть ім’я та прізвище вашого гостя.',
      'Выберите хотя бы один вариант по алкоголю.': 'Оберіть хоча б один варіант щодо напоїв.',
      'Выберите варианты только из предложенного списка.': 'Оберіть варіанти лише із запропонованого списку.',
      'Уточните, пожалуйста, какой напиток вам ближе.': 'Уточніть, будь ласка, який напій вам ближчий.'
    }
  }
} as const;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: (typeof inviteContentByLocale)[Locale];
  ui: typeof uiByLocale.ru | typeof uiByLocale.uk;
  translateValidationMessage: (message: string | undefined) => string | undefined;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const getInitialLocale = (): Locale => 'ru';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(localeStorageKey);

    if (storedLocale === 'ru' || storedLocale === 'uk') {
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const ui = uiByLocale[locale];

    return {
      locale,
      setLocale: setLocaleState,
      content: inviteContentByLocale[locale],
      ui,
      translateValidationMessage: (message) => {
        if (!message) {
          return undefined;
        }

        return ui.validation[message as keyof typeof ui.validation] ?? message;
      }
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used inside LanguageProvider');
  }

  return context;
};

export const useInviteContent = () => useLocale().content;
export const useLocaleUi = () => useLocale().ui;
