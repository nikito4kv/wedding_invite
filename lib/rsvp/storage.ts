import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import type { AlcoholPreference } from '@/lib/constants/rsvp';
import type { CanonicalRsvpPayload, StoredRsvpSubmission } from '@/lib/rsvp/types';

const localDatabasePath = join(process.cwd(), '.data', 'rsvp.sqlite');

interface RsvpSubmissionRow {
  id: string;
  submitted_at: string;
  full_name: string;
  attendance: CanonicalRsvpPayload['attendance'];
  guest_mode: CanonicalRsvpPayload['guestMode'];
  plus_one_name: string | null;
  alcohol_preferences: string;
  alcohol_preference_other: string | null;
  guest_count: number;
  deleted_at: string | null;
  delete_batch_id: string | null;
}

interface ConfirmationRow {
  chat_id: string;
  user_id: string;
  action: 'clear_active_submissions';
  code: string;
  expires_at: string;
}

let client: Client | null = null;
let schemaInitialized = false;

const getDatabaseConfig = () => {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl) {
    return {
      url: tursoUrl,
      authToken: tursoAuthToken || undefined
    };
  }

  mkdirSync(dirname(localDatabasePath), { recursive: true });

  return {
    url: `file:${localDatabasePath}`
  };
};

const getClient = (): Client => {
  if (!client) {
    client = createClient(getDatabaseConfig());
  }

  return client;
};

const initializeSchema = async (): Promise<void> => {
  if (schemaInitialized) {
    return;
  }

  const db = getClient();

  await db.batch([
    `CREATE TABLE IF NOT EXISTS rsvp_submissions (
      id TEXT PRIMARY KEY,
      submitted_at TEXT NOT NULL,
      full_name TEXT NOT NULL,
      attendance TEXT NOT NULL,
      guest_mode TEXT NOT NULL,
      plus_one_name TEXT,
      alcohol_preferences TEXT NOT NULL,
      alcohol_preference_other TEXT,
      guest_count INTEGER NOT NULL,
      deleted_at TEXT,
      delete_batch_id TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_deleted_at
      ON rsvp_submissions(deleted_at)`,
    `CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_delete_batch_id
      ON rsvp_submissions(delete_batch_id)`,
    `CREATE TABLE IF NOT EXISTS bot_confirmations (
      chat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      PRIMARY KEY (chat_id, user_id, action)
    )`
  ]);

  schemaInitialized = true;
};

const rowValueToString = (value: unknown): string | null => {
  return typeof value === 'string' ? value : value === null ? null : String(value);
};

const rowValueToNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : Number(value);
};

const mapRawRow = (row: Record<string, unknown>): RsvpSubmissionRow => ({
  id: rowValueToString(row.id)!,
  submitted_at: rowValueToString(row.submitted_at)!,
  full_name: rowValueToString(row.full_name)!,
  attendance: rowValueToString(row.attendance)! as CanonicalRsvpPayload['attendance'],
  guest_mode: rowValueToString(row.guest_mode)! as CanonicalRsvpPayload['guestMode'],
  plus_one_name: rowValueToString(row.plus_one_name),
  alcohol_preferences: rowValueToString(row.alcohol_preferences)!,
  alcohol_preference_other: rowValueToString(row.alcohol_preference_other),
  guest_count: rowValueToNumber(row.guest_count),
  deleted_at: rowValueToString(row.deleted_at),
  delete_batch_id: rowValueToString(row.delete_batch_id)
});

const mapConfirmationRow = (row: Record<string, unknown> | undefined): ConfirmationRow | null => {
  if (!row) {
    return null;
  }

  return {
    chat_id: rowValueToString(row.chat_id)!,
    user_id: rowValueToString(row.user_id)!,
    action: 'clear_active_submissions',
    code: rowValueToString(row.code)!,
    expires_at: rowValueToString(row.expires_at)!
  };
};

export const getRsvpGuestCount = (payload: Pick<CanonicalRsvpPayload, 'attendance' | 'guestMode' | 'plusOneName'>): number => {
  if (payload.attendance !== 'yes') {
    return 0;
  }

  return payload.guestMode === 'plusOne' && payload.plusOneName ? 2 : 1;
};

const mapSubmissionRow = (row: RsvpSubmissionRow): StoredRsvpSubmission => {
  const parsedPreferences = JSON.parse(row.alcohol_preferences) as AlcoholPreference[];
  const submission: StoredRsvpSubmission = {
    id: row.id,
    submittedAt: row.submitted_at,
    fullName: row.full_name,
    attendance: row.attendance,
    guestMode: row.guest_mode,
    alcoholPreferences: parsedPreferences,
    guestCount: row.guest_count
  };

  if (row.plus_one_name) {
    submission.plusOneName = row.plus_one_name;
  }

  if (row.alcohol_preference_other) {
    submission.alcoholPreferenceOther = row.alcohol_preference_other;
  }

  if (row.deleted_at) {
    submission.deletedAt = row.deleted_at;
  }

  if (row.delete_batch_id) {
    submission.deleteBatchId = row.delete_batch_id;
  }

  return submission;
};

export const listRsvpSubmissions = async (options: { includeDeleted?: boolean } = {}): Promise<StoredRsvpSubmission[]> => {
  await initializeSchema();

  const result = await getClient().execute(
    options.includeDeleted
      ? 'SELECT * FROM rsvp_submissions ORDER BY submitted_at ASC'
      : 'SELECT * FROM rsvp_submissions WHERE deleted_at IS NULL ORDER BY submitted_at ASC'
  );

  return result.rows.map((row) => mapSubmissionRow(mapRawRow(row)));
};

export const saveRsvpSubmission = async (payload: CanonicalRsvpPayload): Promise<StoredRsvpSubmission> => {
  await initializeSchema();

  const storedSubmission: StoredRsvpSubmission = {
    ...payload,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    guestCount: getRsvpGuestCount(payload)
  };

  await getClient().execute({
    sql: `INSERT INTO rsvp_submissions (
      id,
      submitted_at,
      full_name,
      attendance,
      guest_mode,
      plus_one_name,
      alcohol_preferences,
      alcohol_preference_other,
      guest_count,
      deleted_at,
      delete_batch_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
    args: [
      storedSubmission.id,
      storedSubmission.submittedAt,
      storedSubmission.fullName,
      storedSubmission.attendance,
      storedSubmission.guestMode,
      storedSubmission.plusOneName ?? null,
      JSON.stringify(storedSubmission.alcoholPreferences),
      storedSubmission.alcoholPreferenceOther ?? null,
      storedSubmission.guestCount
    ]
  });

  return storedSubmission;
};

export const createClearRsvpConfirmation = async (
  chatId: string,
  userId: string,
  ttlMinutes = 10
): Promise<{ code: string; expiresAt: string }> => {
  await initializeSchema();

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  await getClient().execute({
    sql: `INSERT INTO bot_confirmations (chat_id, user_id, action, code, expires_at)
      VALUES (?, ?, 'clear_active_submissions', ?, ?)
      ON CONFLICT(chat_id, user_id, action)
      DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at`,
    args: [chatId, userId, code, expiresAt]
  });

  return { code, expiresAt };
};

export const cancelClearRsvpConfirmation = async (chatId: string, userId: string): Promise<void> => {
  await initializeSchema();

  await getClient().execute({
    sql: "DELETE FROM bot_confirmations WHERE chat_id = ? AND user_id = ? AND action = 'clear_active_submissions'",
    args: [chatId, userId]
  });
};

const getClearRsvpConfirmation = async (chatId: string, userId: string): Promise<ConfirmationRow | null> => {
  await initializeSchema();

  const result = await getClient().execute({
    sql: "SELECT * FROM bot_confirmations WHERE chat_id = ? AND user_id = ? AND action = 'clear_active_submissions'",
    args: [chatId, userId]
  });

  return mapConfirmationRow(result.rows[0]);
};

export const clearActiveRsvpSubmissionsWithConfirmation = async (
  chatId: string,
  userId: string,
  code: string
): Promise<
  | { ok: true; clearedCount: number; batchId: string }
  | { ok: false; reason: 'missing' | 'expired' | 'invalid_code' }
> => {
  await initializeSchema();

  const confirmation = await getClearRsvpConfirmation(chatId, userId);

  if (!confirmation) {
    return { ok: false, reason: 'missing' };
  }

  if (Date.parse(confirmation.expires_at) < Date.now()) {
    await cancelClearRsvpConfirmation(chatId, userId);
    return { ok: false, reason: 'expired' };
  }

  if (confirmation.code !== code.trim()) {
    return { ok: false, reason: 'invalid_code' };
  }

  const deletedAt = new Date().toISOString();
  const batchId = crypto.randomUUID();
  const result = await getClient().execute({
    sql: 'UPDATE rsvp_submissions SET deleted_at = ?, delete_batch_id = ? WHERE deleted_at IS NULL',
    args: [deletedAt, batchId]
  });

  await cancelClearRsvpConfirmation(chatId, userId);

  return {
    ok: true,
    clearedCount: result.rowsAffected,
    batchId
  };
};

export const restoreLatestClearedRsvpSubmissions = async (): Promise<{ restoredCount: number; batchId: string | null }> => {
  await initializeSchema();

  const latestBatchResult = await getClient().execute(`
    SELECT delete_batch_id
    FROM rsvp_submissions
    WHERE deleted_at IS NOT NULL AND delete_batch_id IS NOT NULL
    ORDER BY deleted_at DESC
    LIMIT 1
  `);
  const latestBatchId = rowValueToString(latestBatchResult.rows[0]?.delete_batch_id);

  if (!latestBatchId) {
    return { restoredCount: 0, batchId: null };
  }

  const result = await getClient().execute({
    sql: 'UPDATE rsvp_submissions SET deleted_at = NULL, delete_batch_id = NULL WHERE delete_batch_id = ?',
    args: [latestBatchId]
  });

  return {
    restoredCount: result.rowsAffected,
    batchId: latestBatchId
  };
};
