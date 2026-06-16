# Kyro Studio — CLAUDE.md

## Project Overview
Marketing agency website for Kyro Studio (kyrostudio.eu) — Meta ads, social media, AI content automation. Built with Next.js App Router, deployed on Vercel (Frankfurt, fra1).

Owner: Kreo (kiran.ramagiri87@gmail.com)

---

## Tech Stack
- **Framework:** Next.js (App Router, `src/` layout)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **i18n:** next-intl — EN + HR, `/en` and `/hr` prefixed routes
- **Email:** Resend API → hello@kyrostudio.eu
- **Analytics:** GTM (`NEXT_PUBLIC_GTM_ID`) + GA4 (`NEXT_PUBLIC_GA_ID`) behind cookie consent
- **Theme:** Dark default, light mode toggle via next-themes
- **Deployment:** Vercel, region fra1
- **Fonts:** Syne (display) + DM Sans (body)

---

## Brand Tokens
```css
--yellow:   #D4D93F   /* Primary accent */
--navy:     #200F8C   /* Hover/depth */
--charcoal: #403B37   /* Secondary */
--bg:       #08080E   /* Dark background */
--white:    #F0F0EA   /* Body text */
```

---

## Project Structure
```
kyro-studio/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          ← fonts, metadata, GTM, JSON-LD, cookie banner
│   │   │   ├── page.tsx            ← homepage (all sections)
│   │   │   └── legal/
│   │   │       ├── privacy/page.tsx
│   │   │       └── terms/page.tsx
│   │   └── api/
│   │       ├── contact/route.ts    ← Resend email handler
│   │       └── briefing/route.ts   ← Morning briefing cron endpoint
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Hero.tsx
│   │   ├── Marquee.tsx
│   │   ├── Services.tsx
│   │   ├── AiAutomation.tsx
│   │   ├── WhyKyro.tsx
│   │   ├── Process.tsx
│   │   ├── CTA.tsx
│   │   ├── Footer.tsx
│   │   ├── CookieBanner.tsx
│   │   └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── rss.ts                  ← Croatian RSS feeds (no API key)
│   │   ├── newsdata.ts             ← International news via NewsData.io
│   │   ├── google-calendar.ts      ← Today's calendar events
│   │   ├── gmail.ts                ← Unread priority emails
│   │   ├── google-sheets.ts        ← Revenue goals + log
│   │   ├── sheets-log.ts           ← Writes briefing run history
│   │   ├── claude.ts               ← Composes briefing via Claude API
│   │   └── telegram.ts             ← Delivers to Telegram
│   ├── messages/
│   │   ├── en.json
│   │   └── hr.json
│   ├── styles/
│   └── i18n/
├── public/
│   └── logo.svg
├── vercel.json
└── CLAUDE.md
```

---

## Environment Variables
```env
# Core
NEXT_PUBLIC_SITE_URL=https://kyrostudio.eu
RESEND_API_KEY=                        # Resend — contact form
NEXT_PUBLIC_GTM_ID=                    # Google Tag Manager
NEXT_PUBLIC_GA_ID=                     # GA4 Measurement ID

# Morning Briefing
ANTHROPIC_API_KEY=                     # Claude API — briefing composition
TELEGRAM_BOT_TOKEN=                    # Telegram bot token
TELEGRAM_CHAT_ID=                      # Telegram chat ID to deliver to
GOOGLE_CLIENT_ID=                      # Google OAuth
GOOGLE_CLIENT_SECRET=                  # Google OAuth
GOOGLE_REFRESH_TOKEN=                  # Google OAuth refresh token (Calendar + Gmail + Sheets)
GOOGLE_SHEET_ID=                       # Google Sheet ID for revenue_log, goals, briefing_log tabs
NEWSDATA_API_KEY=                      # NewsData.io — international news (200 credits/day free)
CRON_SECRET=kyro-secret-2026           # Auth header for manual /api/briefing triggers
```

---

## Morning Briefing System
Daily cron at **05:00 UTC (07:00 Zagreb)** via Vercel cron → `/api/briefing`.

**Flow:**
1. Fetches Croatian RSS (poslovni.hr, index.hr, jutarnji.hr, bug.hr, vecernji.hr, tportal.hr)
2. Fetches real estate feed (njuskalo.hr Sesvete)
3. Fetches international business + tech news (NewsData.io)
4. Fetches today's Google Calendar events
5. Fetches unread Gmail (last 24h, excluding promos/social)
6. Fetches revenue goals + log from Google Sheets
7. Claude translates all Croatian content → English and composes briefing
8. Delivers formatted Markdown briefing to Telegram
9. Logs run to `briefing_log` tab in Google Sheets

**Manual trigger:**
```bash
curl -H "Authorization: Bearer kyro-secret-2026" https://www.kyrostudio.eu/api/briefing
```

**Google Sheets structure expected:**
- Tab `revenue_log`: Date | Client | Amount | Status | Notes
- Tab `goals`: Goal | Target | Current | Period | Notes (revenue target row, invest row)
- Tab `briefing_log`: Date | Status | TelegramSent | Summary

---

## Social Media Links
- **Instagram:** https://www.instagram.com/kyrostudio.eu/
- **LinkedIn:** https://www.linkedin.com/company/kyrostudio-agency/

These are set in `src/messages/en.json`, `src/messages/hr.json`, `src/components/Footer.tsx`, and `src/app/[locale]/layout.tsx` (JSON-LD sameAs).

---

## Vercel Config (`vercel.json`)
```json
{
  "framework": "nextjs",
  "regions": ["fra1"],
  "crons": [{ "path": "/api/briefing", "schedule": "0 5 * * *" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## i18n
- Locales: `en`, `hr` — always-on prefix (`/en/...`, `/hr/...`)
- Translations in `src/messages/en.json` and `src/messages/hr.json`
- Middleware in `src/i18n/`

---

## Key Patterns
- All Google API calls use OAuth2 refresh token flow — `getGoogleAccessToken()` is duplicated per lib file by design (no shared singleton to avoid cold-start issues)
- All data sources in briefing use `Promise.allSettled` — a failing source never blocks the briefing
- Telegram messages auto-split at 4000 chars; Markdown parse failures fall back to plain text
- Cookie banner gates GTM/GA4 — analytics only fire after "Accept All"

---

## Legal Context (for briefing system)
- Settlement with ex-partner Ana (BW and RS companies)
- Document delivery deadline: April 30, 2026
- Follow-up decision meeting: May 13, 2026
- Briefing flags HIGH alert on April 30, May 13, and within 3 days of May 13
