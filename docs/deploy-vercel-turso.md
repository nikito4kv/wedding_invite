# Deploy: Vercel + Turso

## 1. Turso

Install and login:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

Create DB:

```bash
turso db create wedding-invite
```

Get database URL:

```bash
turso db show wedding-invite --url
```

Create token:

```bash
turso db tokens create wedding-invite
```

Save these values for Vercel:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

The app creates tables automatically on first RSVP/bot command.

## 2. Telegram

Regenerate the bot token in BotFather before production:

```text
/revoke
```

Vercel env variables:

```env
RSVP_TELEGRAM_BOT_TOKEN=...
RSVP_TELEGRAM_CHAT_ID=-4946444444
RSVP_TELEGRAM_ADMIN_USER_IDS=435040717
RSVP_TELEGRAM_WEBHOOK_SECRET=long-random-string
```

## 3. Vercel

Push repository to GitHub, then import it in Vercel.

Build settings can stay default:

```text
Build Command: npm run build
Output: .next
Install Command: npm ci
```

Add all env variables from `.env.example` in Vercel Project Settings.

## 4. Set Telegram webhook

After Vercel deployment is live, run locally:

```bash
BOT_TOKEN='your_new_bot_token'
WEBHOOK_SECRET='same_value_as_RSVP_TELEGRAM_WEBHOOK_SECRET'
SITE_URL='https://your-project.vercel.app'

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H 'Content-Type: application/json' \
  -d "{\"url\":\"${SITE_URL}/api/telegram/webhook\",\"secret_token\":\"${WEBHOOK_SECRET}\",\"allowed_updates\":[\"message\"]}"
```

Check webhook:

```bash
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

## 5. Verify

- Open the site.
- Submit RSVP.
- Check that Telegram receives the RSVP.
- Send `/stats` to the RSVP bot/chat.
- Test `/clear_stats`, `/cancel_clear`, and `/restore_last_clear` if needed.

## Notes

- `npm run bot:poll` is only for local/VPS mode. Vercel uses Telegram webhook instead.
- Turso stores RSVP submissions and bot confirmations persistently.
