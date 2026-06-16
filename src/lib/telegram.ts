// lib/telegram.ts
// Sends the morning briefing to your Telegram chat

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("⚠️ Telegram credentials not set — skipping delivery");
    return;
  }

  // Telegram has a 4096 char limit per message
  // If briefing is longer, split it
  const chunks = splitMessage(text, 4000);

  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    TELEGRAM_CHAT_ID,
          text:       chunk,
          parse_mode: "Markdown",
          // Disable link previews for cleaner look
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      // Retry with plain text if Markdown parsing fails
      if (err.includes("can't parse")) {
        await sendPlainText(chunk);
      } else {
        console.warn("Telegram send failed:", err);
      }
    }

    // Small delay between chunks
    if (chunks.length > 1) await sleep(500);
  }
}

async function sendPlainText(text: string): Promise<void> {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:                  TELEGRAM_CHAT_ID,
        text:                     text.replace(/[*_`[\]()]/g, ""),
        disable_web_page_preview: true,
      }),
    }
  );
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    // Split at last newline before limit
    let splitAt = remaining.lastIndexOf("\n", maxLen);
    if (splitAt === -1) splitAt = maxLen;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }
  return chunks;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
