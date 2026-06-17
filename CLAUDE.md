# Syntax Trust Bank

A fintech demo/MVP — React + Vite + Supabase + Tailwind CSS, deployed on Vercel.

## Live site
- **URL:** https://www.syntaxcrest.com (apex redirects to www)
- **Vercel project:** `syntax-members` (`prj_2l5jbJfm609zJvRae9fFA80hrNFI`)
- **Team:** `kblackfx-3337` (`team_jzzlPZF0rScvz18Cr4Xwb1EG`)
- **GitHub repo:** `joeharold639-sudo/sbc`, branch `main`
- **Deploy:** push to `main` → Vercel auto-deploys. Manual: `npx vercel --prod`

## Supabase
- **Project:** `syntax-trust-bank` (`oetuizloaslvjmdjyinx`), region `us-east-1`
- **URL:** `https://oetuizloaslvjmdjyinx.supabase.co`
- **Anon key:** in `.env` as `VITE_SUPABASE_ANON_KEY`
- **Service key:** Supabase Dashboard → Project Settings → API → `service_role`

## Project structure
- `src/pages/` — route-level pages (all lazy-loaded)
- `src/components/` — UI components (dashboard/, layout/, sections/)
- `src/hooks/` — data hooks (`useAccount`, `useTransactions`, `useAdmin`, etc.)
- `src/context/AuthContext.jsx` — auth state, exposes `useAuth()`
- `src/lib/supabase.js` — Supabase client
- `scripts/schema.sql` — full DB schema (run once in Supabase SQL editor)
- `scripts/seed-users.mjs` — seeds demo users (needs `SUPABASE_SERVICE_KEY` env var)

## Database tables
`profiles`, `accounts`, `transactions`, `cards`, `btc_wallets`

- `profiles.is_admin = true` → admin access
- `handle_new_user` trigger auto-creates a `profiles` row on every signup
- `useAccount.js` fetches or creates one `accounts` row per user on first login

## Seeded users
| Email | Password | Role | Balance |
|---|---|---|---|
| sammycrypto25@gmail.com | Adm!n$Synx2026#Kx | Admin | $25,000 |
| nestor25lewis@gmail.com | N3st0r@Trust$826Lw | User | $396,142 |
| joeharold639@gmail.com | (owner account) | Admin | $5,989.32 |
| brokelvin34@gmail.com | (owner account) | User | $5,989.32 |

## Key rules
- Never commit `.env` — it's gitignored. Copy values manually between machines.
- To add more users run `SUPABASE_SERVICE_KEY=<key> node scripts/seed-users.mjs`
- All routes are lazy-loaded — don't import pages eagerly in App.jsx
- Vendor chunks are split in `vite.config.js` — keep react/supabase in `manualChunks`
- Currency is USD throughout. No client-side caching — all state is Supabase or useState

## Local dev
```bash
git clone https://github.com/joeharold639-sudo/sbc.git
cd sbc
npm install
# create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```
