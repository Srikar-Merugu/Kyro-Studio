// lib/gmail.ts
// Fetches unread/priority emails from last 24h via Gmail API

export interface EmailSummary {
  from: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  isImportant: boolean;
}

export async function fetchPriorityEmails(): Promise<EmailSummary[]> {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return [];

  try {
    // Search for unread emails from last 24h, excluding newsletters/promos
    const query = "is:unread newer_than:1d -category:promotions -category:social";
    const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
    listUrl.searchParams.set("q", query);
    listUrl.searchParams.set("maxResults", "15");

    const listRes = await fetch(listUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!listRes.ok) return [];

    const listData = await listRes.json();
    const messages = listData.messages || [];

    // Fetch details for each message in parallel (max 10)
    const details = await Promise.allSettled(
      messages.slice(0, 10).map((msg: { id: string }) =>
        fetchEmailDetail(msg.id, accessToken)
      )
    );

    return details
      .filter(r => r.status === "fulfilled" && r.value)
      .map(r => (r as PromiseFulfilledResult<EmailSummary>).value);

  } catch (err) {
    console.warn("Gmail fetch failed:", err);
    return [];
  }
}

async function fetchEmailDetail(id: string, accessToken: string): Promise<EmailSummary | null> {
  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const headers: { name: string; value: string }[] = data.payload?.headers || [];

    const get = (name: string) => headers.find(h => h.name === name)?.value || "";

    const from    = cleanSender(get("From"));
    const subject = get("Subject") || "(no subject)";
    const date    = get("Date");
    const snippet = (data.snippet || "").slice(0, 200);
    const isImportant = data.labelIds?.includes("IMPORTANT") || false;

    return {
      from,
      subject,
      snippet,
      receivedAt: date,
      isImportant,
    };
  } catch {
    return null;
  }
}

function cleanSender(from: string): string {
  // "John Doe <john@example.com>" → "John Doe <john@example.com>"
  // Just extract the email if no display name
  const match = from.match(/^"?([^"<]+)"?\s*<?([^>]*)>?$/);
  if (match) {
    const name  = match[1].trim();
    const email = match[2].trim();
    return name && name !== email ? `${name} <${email}>` : email;
  }
  return from;
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
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
        client_id:     clientId,
        client_secret: clientSecret,
      }),
    });
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}
