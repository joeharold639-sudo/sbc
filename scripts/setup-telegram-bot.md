# Telegram Bot Setup Guide

## Step 1 — Create the bot

1. Open Telegram and message **@BotFather**
2. Send `/newbot`
3. Choose a name: `Syntax Trust Bank Admin`
4. Choose a username: `syntaxtrustbank_admin_bot` (must end in `bot`)
5. Copy the **bot token** — looks like `7123456789:AAF...`

---

## Step 2 — Get your Telegram user ID

1. Message **@userinfobot** on Telegram
2. It replies with your user ID (a number like `987654321`)
3. If multiple admins, collect all their IDs

---

## Step 3 — Generate a webhook secret

Run this in your terminal to generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4 — Set Supabase secrets

Go to: **Supabase Dashboard → Project → Edge Functions → Manage secrets**

Add these secrets:

| Name                   | Value                                      |
|------------------------|--------------------------------------------|
| `TELEGRAM_BOT_TOKEN`   | Your bot token from BotFather              |
| `TELEGRAM_WEBHOOK_SECRET` | The random hex string from Step 3       |
| `ADMIN_TELEGRAM_IDS`   | Comma-separated admin user IDs (e.g. `987654321,112233445`) |
| `BOT_ADMIN_UUID`       | Your Supabase user UUID (from profiles table) |

---

## Step 5 — Deploy the edge function

Install the Supabase CLI if you haven't:

```bash
npm install -g supabase
```

Login and link:

```bash
supabase login
supabase link --project-ref oetuizloaslvjmdjyinx
```

Deploy:

```bash
supabase functions deploy bot-webhook --no-verify-jwt
```

Copy the deployed function URL — it looks like:
`https://oetuizloaslvjmdjyinx.supabase.co/functions/v1/bot-webhook`

---

## Step 6 — Register the webhook with Telegram

Run this command (replace the placeholders):

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://oetuizloaslvjmdjyinx.supabase.co/functions/v1/bot-webhook",
    "secret_token": "<YOUR_WEBHOOK_SECRET>",
    "allowed_updates": ["message"]
  }'
```

Expected response: `{"ok":true,"result":true,"description":"Webhook was set"}`

---

## Step 7 — Test it

Message your bot on Telegram:

```
/help
```

It should reply with the command list. Then try:

```
/stats
/user sammycrypto25@gmail.com
/credit sammycrypto25@gmail.com 100 Test credit
```

---

## Available commands

| Command | Description |
|---------|-------------|
| `/help` | List all commands |
| `/stats` | Platform totals (users, balance, transactions) |
| `/user <email>` | Full user profile + last 3 transactions |
| `/txns <email> [limit]` | Transaction history (max 20) |
| `/credit <email> <amount> <reason>` | Credit a user's account |
| `/debit <email> <amount> <reason>` | Debit a user's account |
| `/freeze <email>` | Freeze account and all cards |
| `/unfreeze <email>` | Restore account to active |

---

## Security notes

- Only Telegram user IDs in `ADMIN_TELEGRAM_IDS` can use the bot
- Every command is verified against the webhook secret header
- All credit/debit/freeze actions call the `SECURITY DEFINER` RPCs and are logged to `admin_audit_log`
- The bot token and webhook secret are stored in Supabase Vault (never in code or git)
