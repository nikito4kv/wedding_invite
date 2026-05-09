import { readFile } from 'node:fs/promises';

const loadLocalEnv = async () => {
  try {
    const raw = await readFile('.env.local', 'utf8');

    for (const line of raw.split('\n')) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      process.env[key] ??= value;
    }
  } catch {
    // .env.local is optional when real environment variables are provided.
  }
};

await loadLocalEnv();

const botToken = process.env.RSVP_TELEGRAM_BOT_TOKEN;
const localWebhookUrl = process.env.RSVP_LOCAL_WEBHOOK_URL ?? 'http://127.0.0.1:3000/api/telegram/webhook';

if (!botToken) {
  console.error('RSVP_TELEGRAM_BOT_TOKEN is required.');
  process.exit(1);
}

let offset = 0;

console.log(`Telegram polling started. Forwarding updates to ${localWebhookUrl}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

while (true) {
  try {
    const updatesResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        offset,
        timeout: 25,
        allowed_updates: ['message']
      })
    });

    const updatesPayload = await updatesResponse.json();

    if (!updatesPayload.ok) {
      console.error('Telegram getUpdates failed:', updatesPayload.description ?? updatesPayload);
      await sleep(3000);
      continue;
    }

    for (const update of updatesPayload.result ?? []) {
      offset = update.update_id + 1;

      const webhookResponse = await fetch(localWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });

      if (!webhookResponse.ok) {
        console.error('Local webhook returned', webhookResponse.status, await webhookResponse.text());
      }
    }
  } catch (error) {
    console.error('Polling error:', error);
    await sleep(3000);
  }
}
