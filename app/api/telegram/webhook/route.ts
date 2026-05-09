import {
  buildRsvpAnalyticsTelegramMessage,
  cancelClearRsvpConfirmation,
  clearActiveRsvpSubmissionsWithConfirmation,
  createClearRsvpConfirmation,
  listRsvpSubmissions,
  restoreLatestClearedRsvpSubmissions,
  sendTelegramText
} from '@/lib/rsvp';

export const runtime = 'nodejs';

type TelegramChat = {
  id: number;
  type?: string;
  title?: string;
};

type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
};

type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: TelegramChat;
  from?: TelegramUser;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

const parseIdList = (value: string | undefined): Set<string> => {
  return new Set(
    (value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );
};

const parseCommand = (text: string): { command: string; args: string[] } => {
  const parts = text.trim().split(/\s+/);
  const command = parts[0].split('@')[0].toLowerCase();

  return {
    command,
    args: parts.slice(1)
  };
};

const isStatsCommand = (command: string): boolean => {
  return ['/stats', '/summary', '/rsvp', '/сводка'].includes(command);
};

const isClearCommand = (command: string): boolean => {
  return ['/clear_stats', '/clear', '/delete_stats', '/очистить'].includes(command);
};

const isConfirmClearCommand = (command: string): boolean => {
  return ['/confirm_clear', '/confirm', '/подтвердить'].includes(command);
};

const isCancelClearCommand = (command: string): boolean => {
  return ['/cancel_clear', '/cancel', '/отмена'].includes(command);
};

const isRestoreCommand = (command: string): boolean => {
  return ['/restore_last_clear', '/restore', '/восстановить'].includes(command);
};

const isHelpCommand = (command: string): boolean => {
  return ['/start', '/help'].includes(command);
};

const buildHelpMessage = (): string => {
  return [
    '🤍 <b>RSVP-бот Никиты и Софии</b>',
    '',
    'Команды для организаторов:',
    '• /stats — сводка по активным заявкам',
    '• /clear_stats — очистить текущую статистику с подтверждением',
    '• /confirm_clear КОД — подтвердить очистку',
    '• /cancel_clear — отменить очистку',
    '• /restore_last_clear — восстановить последнюю очистку из локальной базы',
    '',
    'Очистка не удаляет заявки навсегда: они остаются в SQLite-базе и могут быть восстановлены.'
  ].join('\n');
};

const isAuthorized = (message: TelegramMessage): boolean => {
  const adminUserIds = parseIdList(process.env.RSVP_TELEGRAM_ADMIN_USER_IDS);
  const allowedCommandChatIds = parseIdList(process.env.RSVP_TELEGRAM_COMMAND_CHAT_IDS);
  const rsvpChatId = process.env.RSVP_TELEGRAM_CHAT_ID?.trim();
  const fromId = message.from?.id.toString();
  const chatId = message.chat.id.toString();

  const adminAllowed = adminUserIds.size === 0 || Boolean(fromId && adminUserIds.has(fromId));
  const chatAllowed =
    message.chat.type === 'private' ||
    allowedCommandChatIds.has(chatId) ||
    Boolean(rsvpChatId && chatId === rsvpChatId);

  return adminAllowed && chatAllowed;
};

const maybeSendMessage = async (chatId: number, text: string): Promise<void> => {
  const botToken = process.env.RSVP_TELEGRAM_BOT_TOKEN?.trim();

  if (!botToken) {
    return;
  }

  await sendTelegramText(botToken, chatId.toString(), text);
};

const handleClearCommand = async (message: TelegramMessage): Promise<void> => {
  const userId = message.from?.id.toString();

  if (!userId) {
    await maybeSendMessage(message.chat.id, 'Не удалось определить пользователя для подтверждения очистки.');
    return;
  }

  const submissions = await listRsvpSubmissions();
  const { code } = await createClearRsvpConfirmation(message.chat.id.toString(), userId);

  await maybeSendMessage(
    message.chat.id,
    [
      '⚠️ <b>Подтверждение очистки RSVP</b>',
      '',
      `Сейчас в активной статистике: <b>${submissions.length}</b> заявок.`,
      'После подтверждения они исчезнут из /stats, но останутся в локальной SQLite-базе для восстановления.',
      '',
      `Чтобы подтвердить, отправьте: <code>/confirm_clear ${code}</code>`,
      'Чтобы отменить: <code>/cancel_clear</code>'
    ].join('\n')
  );
};

const handleConfirmClearCommand = async (message: TelegramMessage, args: string[]): Promise<void> => {
  const userId = message.from?.id.toString();
  const code = args[0];

  if (!userId || !code) {
    await maybeSendMessage(message.chat.id, 'Для подтверждения отправьте команду в формате: <code>/confirm_clear 1234</code>');
    return;
  }

  const result = await clearActiveRsvpSubmissionsWithConfirmation(message.chat.id.toString(), userId, code);

  if (!result.ok) {
    const reasonMessage = {
      missing: 'Сначала запустите очистку командой <code>/clear_stats</code>.',
      expired: 'Код подтверждения истёк. Запустите очистку заново командой <code>/clear_stats</code>.',
      invalid_code: 'Код подтверждения не совпал. Проверьте код или отмените очистку командой <code>/cancel_clear</code>.'
    }[result.reason];

    await maybeSendMessage(message.chat.id, reasonMessage);
    return;
  }

  await maybeSendMessage(
    message.chat.id,
    [
      '✅ <b>Статистика RSVP очищена</b>',
      '',
      `Скрыто активных заявок: <b>${result.clearedCount}</b>.`,
      'Заявки не удалены навсегда: они сохранены в SQLite-базе.',
      'Если очистка была случайной, отправьте <code>/restore_last_clear</code>.'
    ].join('\n')
  );
};

const handleCancelClearCommand = async (message: TelegramMessage): Promise<void> => {
  const userId = message.from?.id.toString();

  if (userId) {
    await cancelClearRsvpConfirmation(message.chat.id.toString(), userId);
  }

  await maybeSendMessage(message.chat.id, 'Ок, очистку отменили. Статистика осталась без изменений 🤍');
};

const handleRestoreCommand = async (message: TelegramMessage): Promise<void> => {
  const result = await restoreLatestClearedRsvpSubmissions();

  if (result.restoredCount === 0) {
    await maybeSendMessage(message.chat.id, 'Пока нечего восстанавливать: последних очищенных заявок не найдено.');
    return;
  }

  await maybeSendMessage(
    message.chat.id,
    [
      '↩️ <b>Последняя очистка восстановлена</b>',
      '',
      `Вернули в активную статистику заявок: <b>${result.restoredCount}</b>.`,
      'Теперь они снова учитываются в /stats.'
    ].join('\n')
  );
};

export const POST = async (request: Request): Promise<Response> => {
  const webhookSecret = process.env.RSVP_TELEGRAM_WEBHOOK_SECRET?.trim();

  if (webhookSecret) {
    const providedSecret = request.headers.get('x-telegram-bot-api-secret-token');

    if (providedSecret !== webhookSecret) {
      return Response.json({ ok: false }, { status: 401 });
    }
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  const text = message?.text;

  if (!message || !text?.startsWith('/')) {
    return Response.json({ ok: true });
  }

  const { command, args } = parseCommand(text);
  const isKnownCommand =
    isHelpCommand(command) ||
    isStatsCommand(command) ||
    isClearCommand(command) ||
    isConfirmClearCommand(command) ||
    isCancelClearCommand(command) ||
    isRestoreCommand(command);

  if (!isKnownCommand) {
    return Response.json({ ok: true });
  }

  if (!isAuthorized(message)) {
    if (message.chat.type === 'private') {
      await maybeSendMessage(message.chat.id, 'Извините, эта команда доступна только организаторам.');
    }

    return Response.json({ ok: true });
  }

  if (isHelpCommand(command)) {
    await maybeSendMessage(message.chat.id, buildHelpMessage());
    return Response.json({ ok: true });
  }

  if (isStatsCommand(command)) {
    const submissions = await listRsvpSubmissions();
    await maybeSendMessage(message.chat.id, buildRsvpAnalyticsTelegramMessage(submissions));
    return Response.json({ ok: true });
  }

  if (isClearCommand(command)) {
    await handleClearCommand(message);
    return Response.json({ ok: true });
  }

  if (isConfirmClearCommand(command)) {
    await handleConfirmClearCommand(message, args);
    return Response.json({ ok: true });
  }

  if (isCancelClearCommand(command)) {
    await handleCancelClearCommand(message);
    return Response.json({ ok: true });
  }

  if (isRestoreCommand(command)) {
    await handleRestoreCommand(message);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
};
