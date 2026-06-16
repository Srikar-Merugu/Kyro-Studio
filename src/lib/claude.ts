// lib/claude.ts
// Composes the morning briefing using Claude API
// Handles Croatian → English translation inline

export interface BriefingOutput {
  telegramText: string;   // Formatted for Telegram (Markdown)
  webData:      WebBriefingData; // Structured for the web dashboard
  summary:      string;   // One-line summary for log
}

export interface WebBriefingData {
  date:              string;
  news:              { international: NewsItem[]; croatia: NewsItem[]; tech: NewsItem[] };
  business:          BusinessItem[];
  meetings:          MeetingItem[];
  emails:            EmailItem[];
  financial:         FinancialData;
  investment:        InvestmentItem[];
  legal:             LegalStatus;
  focus:             string;
}

interface NewsItem     { title: string; source: string; tag: string }
interface BusinessItem { item: string; impact: "positive" | "neutral" | "negative" }
interface MeetingItem  { time: string; title: string; type: string; note: string }
interface EmailItem    { from: string; subject: string; priority: "high" | "medium" | "low"; age: string }
interface FinancialData{ target: number; current: number; items: { client: string; amount: number; status: string }[] }
interface InvestmentItem { item: string; trend: "up" | "neutral" | "down"; delta: string }
interface LegalStatus  { alert: boolean; note: string; priority: "high" | "medium" | "low" }

const SYSTEM_PROMPT = `You are Kreo's personal morning briefing assistant for Kyro Studio, a Croatian marketing agency.

Your job: synthesise raw data into a clean, intelligent daily briefing.

CRITICAL TRANSLATION RULE:
- All Croatian-language content MUST be fully translated to English before summarising.
- The final briefing must be 100% in English. No Croatian words in output whatsoever.
- Translate naturally and contextually, not word-for-word.

CONTEXT ABOUT KREO:
- Runs Kyro Studio (marketing agency: Meta ads, social media, AI content)
- Based in Zagreb, Croatia — Croatian business news is important
- Financial goal: €10,000 net revenue/month
- Investment goal: Croatian real estate (watching Zagreb/Sesvete market)
- Has an ongoing legal/financial settlement with ex-partner Ana (BW and RS companies)
- Legal trigger: document delivery April 30, follow-up meeting May 13

OUTPUT FORMAT:
You must respond with a JSON object in this exact structure:
{
  "telegramText": "string — Telegram-formatted markdown briefing (use *bold*, _italic_, \\n for lines)",
  "webData": {
    "date": "YYYY-MM-DD",
    "news": {
      "international": [{ "title": "...", "source": "...", "tag": "Economy|Politics|World" }],
      "croatia": [{ "title": "...", "source": "...", "tag": "Business|Finance|Legal|Real Estate" }],
      "tech": [{ "title": "...", "source": "...", "tag": "AI|Meta Ads|Tech|Marketing" }]
    },
    "business": [{ "item": "...", "impact": "positive|neutral|negative" }],
    "meetings": [{ "time": "HH:MM", "title": "...", "type": "call|internal|legal|personal", "note": "..." }],
    "emails": [{ "from": "...", "subject": "...", "priority": "high|medium|low", "age": "Xh ago" }],
    "financial": {
      "target": 10000,
      "current": 0,
      "items": [{ "client": "...", "amount": 0, "status": "paid|invoiced|pending" }]
    },
    "investment": [{ "item": "...", "trend": "up|neutral|down", "delta": "..." }],
    "legal": { "alert": false, "note": "...", "priority": "high|medium|low" },
    "focus": "One concise sentence — the single most important action for today"
  },
  "summary": "One-line summary of today's briefing"
}

TELEGRAM FORMAT RULES:
- Use *bold* for section headers
- Keep it scannable — one line per item
- Max ~800 characters total for Telegram
- Include emoji for quick visual scanning
- End with a 🎯 Focus line

Respond ONLY with the JSON object. No preamble, no markdown code fences.`;

export async function composeBriefingWithClaude(data: any): Promise<BriefingOutput> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const userMessage = buildDataPrompt(data);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":         "application/json",
      "x-api-key":            ANTHROPIC_API_KEY,
      "anthropic-version":    "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  const rawText = result.content?.[0]?.text || "{}";

  try {
    const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    return parsed as BriefingOutput;
  } catch {
    throw new Error("Claude returned invalid JSON: " + rawText.slice(0, 200));
  }
}

function buildDataPrompt(data: any): string {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return `Today is ${today}. Here is the raw data for Kreo's morning briefing:

## CROATIAN NEWS (may be in Croatian — translate to English)
${formatRSSItems(data.croatianNews?.croatian)}

## REAL ESTATE (Croatian — translate to English)
${formatRSSItems(data.croatianNews?.realEstate)}

## INTERNATIONAL BUSINESS NEWS
${formatNewsItems(data.internationalNews)}

## TECH & AI NEWS
${formatNewsItems(data.techNews)}
${formatRSSItems(data.croatianNews?.marketing)}

## TODAY'S CALENDAR EVENTS
${formatCalendar(data.calendarEvents)}

## UNREAD EMAILS (last 24h)
${formatEmails(data.emails)}

## FINANCIAL GOALS (from Google Sheets)
Monthly target: €${data.goals?.monthlyTarget || 10000}
Current month revenue: €${data.goals?.currentRevenue || 0} (${data.goals?.percentComplete || 0}%)
Revenue items:
${formatRevenueItems(data.goals?.revenueItems)}
Investment notes: ${data.goals?.investmentNotes || "None"}

## LEGAL CONTEXT
Settlement deadline: April 30 (today) — Ana must deliver BW and RS company financial documents.
Next decision meeting: May 13.
Flag as HIGH alert if today is April 30 or May 13 or within 3 days of May 13.

Please compose the briefing now. Remember: translate ALL Croatian content to English.`;
}

function formatRSSItems(items: any[]): string {
  if (!items?.length) return "No items fetched.";
  return items.map(i => `- [${i.source}] ${i.title}${i.description ? ": " + i.description.slice(0, 120) : ""}`).join("\n");
}

function formatNewsItems(items: any[]): string {
  if (!items?.length) return "No items fetched.";
  return items.map(i => `- [${i.source}] ${i.title}${i.description ? ": " + i.description.slice(0, 120) : ""}`).join("\n");
}

function formatCalendar(events: any[]): string {
  if (!events?.length) return "No events today.";
  return events.map(e => {
    const time = e.isAllDay ? "All day" : formatTime(e.start);
    return `- ${time}: ${e.title}${e.description ? " — " + e.description.slice(0, 80) : ""}`;
  }).join("\n");
}

function formatEmails(emails: any[]): string {
  if (!emails?.length) return "No priority emails.";
  return emails.map(e => `- From: ${e.from} | Subject: ${e.subject} | ${e.snippet?.slice(0, 100)}`).join("\n");
}

function formatRevenueItems(items: any[]): string {
  if (!items?.length) return "No entries this month yet.";
  return items.map(i => `- ${i.client}: €${i.amount} (${i.status})`).join("\n");
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zagreb" });
  } catch { return iso; }
}
