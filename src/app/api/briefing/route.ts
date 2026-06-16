import { NextResponse } from "next/server";
import { fetchCroatianRSS } from "@/lib/rss";
import { fetchInternationalNews } from "@/lib/newsdata";
import { fetchCalendarEvents } from "@/lib/google-calendar";
import { fetchPriorityEmails } from "@/lib/gmail";
import { fetchGoalsFromSheets } from "@/lib/google-sheets";
import { composeBriefingWithClaude } from "@/lib/claude";
import { sendTelegramMessage } from "@/lib/telegram";
import { saveBriefingLog } from "@/lib/sheets-log";

// Vercel cron: runs daily at 07:00 Zagreb time (UTC+2 = 05:00 UTC)
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Security: verify cron secret or manual trigger key
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🌅 Kyro Morning Briefing — starting data collection...");

    // ── 1. Collect all data in parallel ───────────────────────────────────
    const [
      croatianNews,
      internationalNews,
      techNews,
      calendarEvents,
      emails,
      goals,
    ] = await Promise.allSettled([
      fetchCroatianRSS(),
      fetchInternationalNews("general"),
      fetchInternationalNews("technology"),
      fetchCalendarEvents(),
      fetchPriorityEmails(),
      fetchGoalsFromSheets(),
    ]);

    const data = {
      croatianNews:     resolved(croatianNews),
      internationalNews: resolved(internationalNews),
      techNews:         resolved(techNews),
      calendarEvents:   resolved(calendarEvents),
      emails:           resolved(emails),
      goals:            resolved(goals),
      generatedAt:      new Date().toISOString(),
    };

    console.log("✅ Data collected. Sending to Claude...");

    // ── 2. Claude composes + translates everything ─────────────────────────
    const briefing = await composeBriefingWithClaude(data);

    console.log("✅ Briefing composed. Sending to Telegram...");

    // ── 3. Deliver via Telegram ────────────────────────────────────────────
    await sendTelegramMessage(briefing.telegramText);

    // ── 4. Log to Google Sheets ────────────────────────────────────────────
    await saveBriefingLog({
      date: new Date().toISOString().split("T")[0],
      status: "delivered",
      telegramSent: true,
      briefingSummary: briefing.summary,
    });

    console.log("✅ Kyro Briefing complete.");

    return NextResponse.json({
      success: true,
      date: data.generatedAt,
      briefing: briefing,
    });

  } catch (error: any) {
    console.error("❌ Briefing failed:", error);
    // Attempt to notify via Telegram even on failure
    try {
      await sendTelegramMessage(
        `⚠️ *Kyro Briefing Error*\n\n${error.message}\n\nCheck Vercel logs.`
      );
    } catch {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: unwrap Promise.allSettled results gracefully
function resolved<T>(result: PromiseSettledResult<T>): T | null {
  if (result.status === "fulfilled") return result.value;
  console.warn("⚠️ Data source failed:", result.reason?.message);
  return null;
}
