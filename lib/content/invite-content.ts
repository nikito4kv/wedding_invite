import {
  alcoholPreferences,
  attendanceOptions,
  guestFormatOptions,
  type AlcoholPreference,
  type AttendanceValue,
  type GuestFormatValue
} from '@/lib/constants/rsvp';

const eventDateTimeIso = '2026-07-14T14:00:00+04:00' as const;
const mapDestination = 'Georgia, Kvariati, ul. Ioane Lazi, 27' as const;
type CountdownUnitId = 'days' | 'hours' | 'minutes' | 'seconds';

const buildGoogleMapsDestinationUrl = (destination: string): string => {
  const params = new URLSearchParams({
    api: '1',
    destination
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export interface InviteContent {
  couple: {
    partnerOne: string;
    partnerTwo: string;
    displayTitle: string;
  };
  hero: {
    eyebrow: string;
    subtitle: string;
    lead: string;
  };
  event: {
    datetimeIso: typeof eventDateTimeIso;
    timezone: 'Asia/Tbilisi';
    utcTimestampMs: number;
  };
  countdown: {
    eyebrow: string;
    title: string;
    intro: string;
    completionLabel: string;
    units: Array<{
      id: CountdownUnitId;
      label: string;
    }>;
  };
  calendar: {
    eyebrow: string;
    title: string;
    monthLabel: string;
    weekdayLabel: string;
    yearLabel: string;
    note: string;
  };
  partyFormat: {
    eyebrow: string;
    title: string;
    description: string;
    note: string;
    dressCode: {
      title: string;
      intro: string;
      groups: Array<{
        title: string;
        text: string;
      }>;
      palette: Array<{
        label: string;
        color: string;
      }>;
      paletteNote: string;
      importantTitle: string;
      packingList: string[];
      overnightNote: string;
    };
  };
  scheduleSection: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  timeline: Array<{
    id: string;
    timeLabel: string;
    title: string;
    description: string;
  }>;
  venue: {
    title: string;
    label: string;
    address: string;
    mapDestination: typeof mapDestination;
    mapCtaLabel: string;
    mapCtaUrl: string;
  };
  chat: {
    title: string;
    description: string;
    label: string;
    url: string;
  };
  organizers: {
    title: string;
    primary: {
      name: string;
      role: string;
      telegram: string;
    };
    backup: {
      name: string;
      role: string;
      telegram: string;
    };
  };
  faq: {
    title: string;
    items: Array<{
      id: string;
      question: string;
      answerPlaceholder: string;
      answerLines: string[];
    }>;
  };
  assets: {
    audio: {
      path: string;
      title: string;
    };
  };
  rsvp: {
    sectionTitle: string;
    sectionLead: string;
    noteCard: {
      title: string;
      text: string;
    };
    successState: {
      eyebrow: string;
      title: string;
    };
    failureState: {
      eyebrow: string;
      title: string;
      detail: string;
    };
    submitButton: {
      idle: string;
      pending: string;
    };
    attendanceOptions: ReadonlyArray<{ value: AttendanceValue; label: string }>;
    guestFormatOptions: ReadonlyArray<{ value: GuestFormatValue; label: string }>;
    plusOneNameField: {
      key: 'plusOneName';
      enabledWhen: {
        guestFormatIs: GuestFormatValue;
        attendanceIs: AttendanceValue;
      };
      placeholder: string;
    };
    alcoholPreferenceOptions: typeof alcoholPreferences;
    alcoholPreferenceLabels: Record<AlcoholPreference, string>;
  };
}

export const inviteContent: InviteContent = {
  couple: {
    partnerOne: 'Никита',
    partnerTwo: 'София',
    displayTitle: 'Никита & София'
  },
  hero: {
    eyebrow: '14 июля 2026 • Kvariati Terrace, Georgia',
    subtitle: 'День, когда море, солнце и любовь станут нашей новой семейной историей.',
    lead:
      'Совсем скоро мы скажем друг другу «да» и будем счастливы разделить этот тёплый, красивый и очень личный праздник вместе с вами.'
  },
  event: {
    datetimeIso: eventDateTimeIso,
    timezone: 'Asia/Tbilisi',
    utcTimestampMs: Date.parse(eventDateTimeIso)
  },
  countdown: {
    eyebrow: 'До встречи у моря',
    title: 'Обратный отсчёт до нашего дня',
    intro: 'Считаем дни, часы и минуты до 14 июля 2026 года, 14:00 по Тбилиси.',
    completionLabel: 'Этот момент уже настал — мы празднуем вместе.',
    units: [
      { id: 'days', label: 'дней' },
      { id: 'hours', label: 'часов' },
      { id: 'minutes', label: 'минут' },
      { id: 'seconds', label: 'секунд' }
    ]
  },
  calendar: {
    eyebrow: 'Сохраните дату',
    title: 'Вторник, 14 июля 2026',
    monthLabel: 'июль',
    weekdayLabel: 'вторник',
    yearLabel: '2026',
    note: 'Пусть этот день будет отмечен в календаре сердцем — мы очень ждём вас рядом.'
  },
  partyFormat: {
    eyebrow: 'Формат праздника',
    title: 'Вечеринка',
    description:
      'Мы мечтаем о лёгком, расслабленном и очень тёплом празднике в загородном доме: красота без лишней строгости, музыка, разговоры, танцы и уютный отдых у бассейна.',
    note: 'Планируйте не только красивый образ на церемонию, но и комфортный отдых после неё — вечер можно будет продолжить в доме.',
    dressCode: {
      title: 'Дресс-код',
      intro:
        'Будем очень рады, если вы поддержите атмосферу нашего дня: выбирайте нарядные однотонные образы в спокойной, естественной цветовой гамме — лёгкие, красивые и по-летнему уютные.',
      groups: [
        {
          title: 'Для девушек',
          text: 'Платья, костюмы, лёгкие вечерние или коктейльные образы.'
        },
        {
          title: 'Для мужчин',
          text: 'Костюмы, рубашки, льняные комплекты или элегантный повседневный стиль.'
        }
      ],
      palette: [
        { label: 'Терракота', color: '#a96f61' },
        { label: 'Роза', color: '#bd7d8a' },
        { label: 'Персик', color: '#e99d6e' },
        { label: 'Карамель', color: '#d1a164' },
        { label: 'Бежевый', color: '#e7c5a9' },
        { label: 'Шампань', color: '#ddc892' },
        { label: 'Шалфей', color: '#91a789' },
        { label: 'Олива', color: '#778344' },
        { label: 'Графит', color: '#56616c' },
        { label: 'Чёрный', color: '#1f2020' }
      ],
      paletteNote:
        'Палитра — это мягкий ориентир: можно выбирать не только эти точные цвета, но и близкие к ним оттенки, чтобы образ оставался вашим и гармонично вписывался в атмосферу дня.',
      importantTitle: 'Важно',
      packingList: ['купальники / плавки', 'удобная сменная одежда', 'вещи для ночёвки'],
      overnightNote:
        'После вечерней части можно будет остаться ночевать в доме — для гостей будут подготовлены спальные места.'
    }
  },
  scheduleSection: {
    eyebrow: 'Тайминг дня',
    title: 'Как пройдёт наш свадебный день',
    intro: 'Собрали основные моменты, чтобы вам было легко почувствовать ритм праздника и вовремя оказаться рядом.'
  },
  timeline: [
    {
      id: 'welcome',
      timeLabel: '14:00',
      title: 'Начало праздника',
      description: 'Встречаемся, обнимаемся и открываем этот волшебный день вместе.'
    },
    {
      id: 'ceremony',
      timeLabel: '14:30',
      title: 'Церемония',
      description: 'Самое важное «да» в нашей жизни — будем счастливы разделить этот момент с вами.'
    },
    {
      id: 'banquet',
      timeLabel: '15:30',
      title: 'Банкет',
      description: 'Праздничный стол, тёплые слова и танцы под любимую музыку.'
    },
    {
      id: 'evening-end',
      timeLabel: '23:00',
      title: 'Завершение вечера',
      description: 'Провожаем этот день с благодарностью за вашу любовь и поддержку.'
    }
  ],
  venue: {
    title: 'Локация',
    label: 'Kvariati Terrace',
    address: 'Georgia, Kvariati, ul. Ioane Lazi, 27',
    mapDestination,
    mapCtaLabel: 'Открыть маршрут в Google Maps',
    mapCtaUrl: buildGoogleMapsDestinationUrl(mapDestination)
  },
  chat: {
    title: 'Чат гостей',
    description: 'Оперативные обновления по дню свадьбы и ответы на быстрые вопросы.',
    label: 'Чат гостей в Telegram',
    url: 'https://t.me/+xes5a6HSJQpmNzUy'
  },
  organizers: {
    title: 'Организаторы',
    primary: {
      name: 'Дарья',
      role: 'Главный контакт',
      telegram: '@d_a_r_a_p_d_d'
    },
    backup: {
      name: 'Егор',
      role: 'Резервный контакт',
      telegram: '@Egor_Taranov'
    }
  },
  faq: {
    title: 'Вопросы',
    items: [
      {
        id: 'arrival-transfer',
        question: 'Как добраться? 🚗',
        answerPlaceholder:
          'До локации нужно будет добираться самостоятельно. Место находится достаточно удобно, а если по дороге возникнут вопросы с маршрутом или такси, мы обязательно поможем. Главное — церемония, ужин, вечеринка и ночёвка будут проходить в одном месте, поэтому после приезда можно просто расслабиться и быть вместе с нами.',
        answerLines: [
          'До локации нужно будет добираться самостоятельно.',
          'Место находится достаточно удобно, а если возникнут сложности с маршрутом или такси — мы обязательно поможем 💛',
          'Церемония, ужин, вечеринка и ночёвка будут в одном месте — после приезда можно просто расслабиться ✨'
        ]
      },
      {
        id: 'overnight-stay',
        question: 'Можно ли остаться на ночь? 🏡',
        answerPlaceholder:
          'Да, в доме будут подготовлены спальные места для гостей. Возьмите с собой всё необходимое для комфортного отдыха: сменную одежду, вещи для сна и купальники или плавки.',
        answerLines: [
          'Да! В доме будут подготовлены спальные места, поэтому после праздника можно остаться ночевать 🏡',
          'Возьмите сменную одежду, вещи для сна и купальники или плавки 🌊'
        ]
      },
      {
        id: 'flowers',
        question: 'Нужны ли цветы? 💐',
        answerPlaceholder:
          'Ваше присутствие на нашей свадьбе — уже самый большой подарок для нас. Цветы совсем не обязательны: если хочется заменить букет чем-то тёплым и полезным, можно выбрать бутылку хорошего вина или игристого с небольшой запиской для наших будущих семейных вечеров.',
        answerLines: [
          'Ваше присутствие — уже самый большой подарок для нас 🫶',
          'Цветы совсем не обязательны: если хочется заменить букет чем-то тёплым и полезным, можно выбрать бутылку хорошего вина или игристого с небольшой запиской для наших будущих семейных вечеров ✨'
        ]
      },
      {
        id: 'gift',
        question: 'Что подарить? 🎁',
        answerPlaceholder:
          'Главное для нас — разделить этот день вместе с вами. Если вам захочется поздравить нас подарком, мы будем благодарны за вклад в наши будущие планы и совместные путешествия.',
        answerLines: [
          'Главное для нас — разделить этот день вместе с вами 💛',
          'Если захочется поздравить нас подарком, будем благодарны за вклад в будущие планы и совместные путешествия ✈️'
        ]
      },
      {
        id: 'pool',
        question: 'Будет ли бассейн? 🌊',
        answerPlaceholder:
          'Да, бассейн будет. Поэтому обязательно берите с собой купальники или плавки и всё, что нужно для лёгкого отдыха у воды после праздничной части.',
        answerLines: [
          'Да, бассейн будет!',
          'Берите купальники или плавки и всё, что нужно для красивого отдыха у воды после праздничной части 😄'
        ]
      },
      {
        id: 'wedding-format',
        question: 'Какой будет формат свадьбы? ✨',
        answerPlaceholder:
          'Это будет камерный, уютный и очень живой праздник: церемония, общий ужин, музыка, танцы, бассейн и много времени вместе. Без лишнего официоза — просто красивый день рядом с любимыми людьми.',
        answerLines: [
          'Камерный, уютный и живой праздник: церемония, общий ужин, музыка, танцы, бассейн и время вместе.',
          'Без лишнего официоза — просто красивый день рядом с любимыми людьми 🤍'
        ]
      }
    ]
  },
  assets: {
    audio: {
      path: '/placeholders/audio/our-song.wav',
      title: 'Наша мелодия (placeholder)'
    }
  },
  rsvp: {
    sectionTitle: 'Подтвердите, пожалуйста, ваше присутствие',
    sectionLead:
      'Нам важно заранее понять состав гостей, формат присутствия и предпочтения по напиткам, чтобы день у моря получился тёплым, красивым и по-настоящему заботливым для каждого.',
    noteCard: {
      title: 'Как устроена форма',
      text:
        'Ответ отправляется прямо организаторам. Если планы изменятся позже, пожалуйста, дайте знать одним из удобных способов связи ниже.'
    },
    successState: {
      eyebrow: 'Ответ получен',
      title: 'Спасибо, мы вас записали'
    },
    failureState: {
      eyebrow: 'Письмо не ушло',
      title: 'Попробуйте отправить форму ещё раз',
      detail:
        'Если ошибка повторится, свяжитесь напрямую с организаторами — они помогут зафиксировать ваш ответ вручную.'
    },
    submitButton: {
      idle: 'Отправить ответ',
      pending: 'Отправляем ответ...'
    },
    attendanceOptions,
    guestFormatOptions,
    plusOneNameField: {
      key: 'plusOneName',
      enabledWhen: {
        guestFormatIs: 'plusOne',
        attendanceIs: 'yes'
      },
      placeholder: 'Введите имя и фамилию вашего гостя'
    },
    alcoholPreferenceOptions: alcoholPreferences,
    alcoholPreferenceLabels: {
      'Красное вино': 'Красное вино',
      'Белое вино': 'Белое вино',
      'Игристое': 'Игристое',
      'Виски': 'Виски',
      'Без алкоголя': 'Без алкоголя',
      'Другое': 'Другое'
    }
  }
};

export const inviteContentUk: InviteContent = {
  ...inviteContent,
  couple: {
    partnerOne: 'Микита',
    partnerTwo: 'Софія',
    displayTitle: 'Микита & Софія'
  },
  hero: {
    eyebrow: '14 липня 2026 • Kvariati Terrace, Georgia',
    subtitle: 'День, коли море, сонце й любов стануть нашою новою сімейною історією.',
    lead:
      'Зовсім скоро ми скажемо один одному «так» і будемо щасливі розділити це тепле, красиве й дуже особисте свято разом із вами.'
  },
  countdown: {
    eyebrow: 'До зустрічі біля моря',
    title: 'Зворотний відлік до нашого дня',
    intro: 'Рахуємо дні, години й хвилини до 14 липня 2026 року, 14:00 за Тбілісі.',
    completionLabel: 'Цей момент уже настав — ми святкуємо разом.',
    units: [
      { id: 'days', label: 'днів' },
      { id: 'hours', label: 'годин' },
      { id: 'minutes', label: 'хвилин' },
      { id: 'seconds', label: 'секунд' }
    ]
  },
  calendar: {
    ...inviteContent.calendar,
    eyebrow: 'Збережіть дату',
    title: 'Вівторок, 14 липня 2026',
    monthLabel: 'липень',
    weekdayLabel: 'вівторок',
    note: 'Нехай цей день буде позначений у календарі серцем — ми дуже чекаємо вас поруч.'
  },
  partyFormat: {
    ...inviteContent.partyFormat,
    eyebrow: 'Формат свята',
    title: 'Вечірка',
    description:
      'Ми мріємо про легке, розслаблене й дуже тепле свято в заміському будинку: краса без зайвої офіційності, музика, розмови, танці й затишний відпочинок біля басейну.',
    note: 'Плануйте не лише красивий образ для церемонії, а й комфортний відпочинок після неї — вечір можна буде продовжити в домі.',
    dressCode: {
      ...inviteContent.partyFormat.dressCode,
      title: 'Дрес-код',
      intro:
        'Будемо дуже раді, якщо ви підтримаєте атмосферу нашого дня: обирайте ошатні однотонні образи у спокійній, природній кольоровій гамі — легкі, красиві й по-літньому затишні.',
      groups: [
        {
          title: 'Для дівчат',
          text: 'Сукні, костюми, легкі вечірні або коктейльні образи.'
        },
        {
          title: 'Для чоловіків',
          text: 'Костюми, сорочки, лляні комплекти або елегантний повсякденний стиль.'
        }
      ],
      palette: [
        { label: 'Теракота', color: '#a96f61' },
        { label: 'Роза', color: '#bd7d8a' },
        { label: 'Персик', color: '#e99d6e' },
        { label: 'Карамель', color: '#d1a164' },
        { label: 'Бежевий', color: '#e7c5a9' },
        { label: 'Шампань', color: '#ddc892' },
        { label: 'Шавлія', color: '#91a789' },
        { label: 'Олива', color: '#778344' },
        { label: 'Графіт', color: '#56616c' },
        { label: 'Чорний', color: '#1f2020' }
      ],
      paletteNote:
        'Палітра — це м’який орієнтир: можна обирати не лише ці точні кольори, а й близькі до них відтінки, щоб образ залишався вашим і гармонійно вписувався в атмосферу дня.',
      importantTitle: 'Важливо',
      packingList: ['купальники / плавки', 'зручний змінний одяг', 'речі для ночівлі'],
      overnightNote:
        'Після вечірньої частини можна буде залишитися ночувати в домі — для гостей будуть підготовлені спальні місця.'
    }
  },
  scheduleSection: {
    eyebrow: 'Таймінг дня',
    title: 'Як пройде наш весільний день',
    intro: 'Зібрали головні моменти, щоб вам було легко відчути ритм свята й вчасно бути поруч.'
  },
  timeline: [
    {
      id: 'welcome',
      timeLabel: '14:00',
      title: 'Початок свята',
      description: 'Зустрічаємося, обіймаємося й відкриваємо цей чарівний день разом.'
    },
    {
      id: 'ceremony',
      timeLabel: '14:30',
      title: 'Церемонія',
      description: 'Найважливіше «так» у нашому житті — будемо щасливі розділити цей момент із вами.'
    },
    {
      id: 'banquet',
      timeLabel: '15:30',
      title: 'Святкова вечеря',
      description: 'Святковий стіл, теплі слова й танці під улюблену музику.'
    },
    {
      id: 'evening-end',
      timeLabel: '23:00',
      title: 'Завершення вечора',
      description: 'Проводжаємо цей день із вдячністю за вашу любов і підтримку.'
    }
  ],
  venue: {
    ...inviteContent.venue,
    title: 'Локація',
    mapCtaLabel: 'Відкрити маршрут у Google Maps'
  },
  chat: {
    ...inviteContent.chat,
    title: 'Чат гостей',
    description: 'Оперативні оновлення щодо дня весілля й відповіді на швидкі запитання.',
    label: 'Чат гостей у Telegram'
  },
  organizers: {
    title: 'Контакти',
    primary: {
      name: 'Дар’я',
      role: 'Головний контакт',
      telegram: '@d_a_r_a_p_d_d'
    },
    backup: {
      name: 'Єгор',
      role: 'Резервний контакт',
      telegram: '@Egor_Taranov'
    }
  },
  faq: {
    title: 'Питання',
    items: [
      {
        id: 'arrival-transfer',
        question: 'Як дістатися? 🚗',
        answerPlaceholder:
          'До локації потрібно буде добиратися самостійно. Місце розташоване досить зручно, а якщо дорогою виникнуть питання з маршрутом або таксі, ми обов’язково допоможемо. Головне — церемонія, вечеря, вечірка й ночівля будуть в одному місці, тож після приїзду можна просто розслабитися й бути з нами.',
        answerLines: [
          'До локації потрібно буде добиратися самостійно.',
          'Місце розташоване досить зручно, а якщо виникнуть складнощі з маршрутом або таксі — ми обов’язково допоможемо 💛',
          'Церемонія, вечеря, вечірка й ночівля будуть в одному місці — після приїзду можна просто розслабитися ✨'
        ]
      },
      {
        id: 'overnight-stay',
        question: 'Чи можна залишитися на ніч? 🏡',
        answerPlaceholder:
          'Так, у домі будуть підготовлені спальні місця для гостей. Візьміть із собою все необхідне для комфортного відпочинку: змінний одяг, речі для сну та купальники або плавки.',
        answerLines: [
          'Так! У домі будуть підготовлені спальні місця, тому після свята можна залишитися ночувати 🏡',
          'Візьміть змінний одяг, речі для сну та купальники або плавки 🌊'
        ]
      },
      {
        id: 'flowers',
        question: 'Чи потрібні квіти? 💐',
        answerPlaceholder:
          'Ваша присутність на нашому весіллі — уже найбільший подарунок для нас. Квіти зовсім не обов’язкові: якщо хочеться замінити букет чимось теплим і корисним, можна обрати пляшку хорошого вина або ігристого з невеликою запискою для наших майбутніх сімейних вечорів.',
        answerLines: [
          'Ваша присутність — уже найбільший подарунок для нас 🫶',
          'Квіти зовсім не обов’язкові: якщо хочеться замінити букет чимось теплим і корисним, можна обрати пляшку хорошого вина або ігристого з невеликою запискою для наших майбутніх сімейних вечорів ✨'
        ]
      },
      {
        id: 'gift',
        question: 'Що подарувати? 🎁',
        answerPlaceholder:
          'Найголовніше для нас — розділити цей день разом із вами. Якщо вам захочеться привітати нас подарунком, будемо вдячні за внесок у наші майбутні плани та спільні подорожі.',
        answerLines: [
          'Найголовніше для нас — розділити цей день разом із вами 💛',
          'Якщо захочеться привітати нас подарунком, будемо вдячні за внесок у майбутні плани та спільні подорожі ✈️'
        ]
      },
      {
        id: 'pool',
        question: 'Чи буде басейн? 🌊',
        answerPlaceholder:
          'Так, басейн буде. Тому обов’язково беріть із собою купальники або плавки й усе, що потрібно для легкого відпочинку біля води після святкової частини.',
        answerLines: [
          'Так, басейн буде!',
          'Беріть купальники або плавки й усе, що потрібно для красивого відпочинку біля води після святкової частини 😄'
        ]
      },
      {
        id: 'wedding-format',
        question: 'Яким буде формат весілля? ✨',
        answerPlaceholder:
          'Це буде камерне, затишне й дуже живе свято: церемонія, спільна вечеря, музика, танці, басейн і багато часу разом. Без зайвої офіційності — просто красивий день поруч із близькими людьми.',
        answerLines: [
          'Камерне, затишне й живе свято: церемонія, спільна вечеря, музика, танці, басейн і час разом.',
          'Без зайвої офіційності — просто красивий день поруч із близькими людьми 🤍'
        ]
      }
    ]
  },
  assets: {
    audio: {
      path: '/placeholders/audio/our-song.wav',
      title: 'Наша мелодія (placeholder)'
    }
  },
  rsvp: {
    ...inviteContent.rsvp,
    sectionTitle: 'Підтвердьте, будь ласка, вашу присутність',
    sectionLead:
      'Нам важливо заздалегідь зрозуміти склад гостей, формат присутності та вподобання щодо напоїв, щоб день біля моря вийшов теплим, красивим і по-справжньому турботливим для кожного.',
    noteCard: {
      title: 'Як працює форма',
      text:
        'Відповідь одразу надсилається організаторам. Якщо плани зміняться пізніше, будь ласка, повідомте одним зі зручних способів зв’язку нижче.'
    },
    successState: {
      eyebrow: 'Відповідь отримано',
      title: 'Дякуємо, ми вас записали'
    },
    failureState: {
      eyebrow: 'Повідомлення не надіслалося',
      title: 'Спробуйте надіслати форму ще раз',
      detail:
        'Якщо помилка повториться, зв’яжіться напряму з контактами — вони допоможуть зафіксувати вашу відповідь вручну.'
    },
    submitButton: {
      idle: 'Надіслати відповідь',
      pending: 'Надсилаємо відповідь...'
    },
    attendanceOptions: [
      { value: 'yes', label: 'З радістю прийду' },
      { value: 'no', label: 'На жаль, не зможу' }
    ],
    guestFormatOptions: [
      { value: 'solo', label: 'Прийду один / одна' },
      { value: 'plusOne', label: 'Прийду з парою' }
    ],
    plusOneNameField: {
      ...inviteContent.rsvp.plusOneNameField,
      placeholder: 'Введіть ім’я та прізвище вашого гостя'
    },
    alcoholPreferenceLabels: {
      'Красное вино': 'Червоне вино',
      'Белое вино': 'Біле вино',
      'Игристое': 'Ігристе',
      'Виски': 'Віскі',
      'Без алкоголя': 'Без алкоголю',
      'Другое': 'Інше'
    }
  }
};

export const inviteContentByLocale = {
  ru: inviteContent,
  uk: inviteContentUk
} as const;

export { buildGoogleMapsDestinationUrl };
