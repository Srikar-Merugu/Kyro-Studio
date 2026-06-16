// lib/google-sheets.ts
// Reads financial goals + revenue log from Google Sheets

export interface GoalsData {
  monthlyTarget: number;
  currentRevenue: number;
  percentComplete: number;
  revenueItems: RevenueItem[];
  investmentNotes: string;
}

export interface RevenueItem {
  client: string;
  amount: number;
  status: "paid" | "invoiced" | "pending";
  date: string;
}

// Your Google Sheet ID — set this in env vars
// Sheet structure:
//   Tab "revenue_log": Date | Client | Amount | Status | Notes
//   Tab "goals":       Goal | Target | Current | Period | Notes
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function fetchGoalsFromSheets(): Promise<GoalsData> {
  const accessToken = await getGoogleAccessToken();

  // Fallback values if Sheets isn't connected yet
  const fallback: GoalsData = {
    monthlyTarget:   10000,
    currentRevenue:  0,
    percentComplete: 0,
    revenueItems:    [],
    investmentNotes: "No investment notes available.",
  };

  if (!accessToken || !SHEET_ID) return fallback;

  try {
    // Read revenue_log tab — columns: Date, Client, Amount, Status, Notes
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"
    const revenueRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/revenue_log!A2:E100`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(8000) }
    );

    const revenueData = await revenueRes.json();
    const rows: string[][] = revenueData.values || [];

    // Filter to current month
    const monthItems: RevenueItem[] = rows
      .filter(row => row[0]?.startsWith(currentMonth))
      .map(row => ({
        date:   row[0] || "",
        client: row[1] || "Unknown",
        amount: parseFloat(row[2]) || 0,
        status: (row[3] || "pending").toLowerCase() as RevenueItem["status"],
      }));

    const currentRevenue = monthItems
      .filter(i => i.status === "paid" || i.status === "invoiced")
      .reduce((sum, i) => sum + i.amount, 0);

    // Read goals tab
    const goalsRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/goals!A2:E10`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(8000) }
    );
    const goalsData = await goalsRes.json();
    const goalRows: string[][] = goalsData.values || [];

    // Find monthly revenue target
    const revenueGoalRow = goalRows.find(r => r[0]?.toLowerCase().includes("revenue"));
    const monthlyTarget = parseFloat(revenueGoalRow?.[1] || "10000") || 10000;

    // Find investment notes
    const investRow = goalRows.find(r => r[0]?.toLowerCase().includes("invest"));
    const investmentNotes = investRow?.[4] || "Monitoring Zagreb/Sesvete real estate market.";

    return {
      monthlyTarget,
      currentRevenue,
      percentComplete: Math.round((currentRevenue / monthlyTarget) * 100),
      revenueItems: monthItems,
      investmentNotes,
    };
  } catch (err) {
    console.warn("Sheets fetch failed:", err);
    return fallback;
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

// ── Write helpers ──────────────────────────────────────────────────────────

export async function appendRevenueRow(item: RevenueItem): Promise<void> {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken || !SHEET_ID) return;

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/revenue_log!A:E:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        values: [[item.date, item.client, item.amount, item.status, ""]],
      }),
    }
  );
}
