// lib/google-calendar.ts
// Fetches today's calendar events using Google Calendar API + OAuth tokens

export interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  isAllDay: boolean;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", today.toISOString());
  url.searchParams.set("timeMax", tomorrow.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "15");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn("Calendar API error:", res.status);
      return [];
    }

    const data = await res.json();
    return (data.items || []).map((event: any) => ({
      title:       event.summary || "Untitled",
      start:       event.start?.dateTime || event.start?.date || "",
      end:         event.end?.dateTime || event.end?.date || "",
      description: event.description || "",
      location:    event.location || "",
      isAllDay:    !!event.start?.date && !event.start?.dateTime,
    }));
  } catch (err) {
    console.warn("Calendar fetch failed:", err);
    return [];
  }
}

async function getGoogleAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    console.warn("⚠️ Google OAuth credentials not set");
    return null;
  }

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
