// lib/sheets-log.ts
// Appends each briefing run to the briefing_log tab in Google Sheets

interface BriefingLogEntry {
  date:            string;
  status:          string;
  telegramSent:    boolean;
  briefingSummary: string;
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function saveBriefingLog(entry: BriefingLogEntry): Promise<void> {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken || !SHEET_ID) {
    console.warn("⚠️ Cannot save log — missing credentials");
    return;
  }

  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/briefing_log!A:D:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[
            entry.date,
            entry.status,
            entry.telegramSent ? "Yes" : "No",
            entry.briefingSummary,
          ]],
        }),
      }
    );
  } catch (err) {
    console.warn("Failed to save briefing log:", err);
  }
}

async function getGoogleAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) return null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token", refresh_token: refreshToken,
        client_id: clientId, client_secret: clientSecret,
      }),
    });
    const data = await res.json();
    return data.access_token || null;
  } catch { return null; }
}
