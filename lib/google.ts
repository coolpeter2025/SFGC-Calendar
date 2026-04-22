const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

export interface EventData {
  title: string;
  start_iso: string;
  end_iso: string;
  location?: string;
  description?: string;
  all_day?: boolean;
}

export interface UpcomingEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  htmlLink: string;
}

async function getAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    grant_type: "refresh_token",
  });
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) throw new Error(`Google token refresh ${resp.status}: ${await resp.text()}`);
  const data = (await resp.json()) as { access_token: string };
  return data.access_token;
}

function calendarId(): string {
  return encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");
}

function addDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function createEvent(ev: EventData): Promise<string> {
  const token = await getAccessToken();
  const tz = process.env.TIMEZONE || "America/New_York";

  let start: Record<string, string>;
  let end: Record<string, string>;

  if (ev.all_day) {
    const startDate = ev.start_iso.slice(0, 10);
    const endDateRaw = ev.end_iso.slice(0, 10);
    const endDate = endDateRaw && endDateRaw > startDate ? addDay(endDateRaw) : addDay(startDate);
    start = { date: startDate };
    end = { date: endDate };
  } else {
    start = { dateTime: ev.start_iso, timeZone: tz };
    end = { dateTime: ev.end_iso, timeZone: tz };
  }

  const resp = await fetch(`${API}/calendars/${calendarId()}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      summary: ev.title,
      location: ev.location,
      description: ev.description,
      start,
      end,
    }),
  });
  if (!resp.ok) throw new Error(`Calendar create ${resp.status}: ${await resp.text()}`);
  const data = (await resp.json()) as { htmlLink: string };
  return data.htmlLink;
}

export async function listInRange(
  startIso: string,
  endIso: string,
  max = 250,
): Promise<UpcomingEvent[]> {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    timeMin: startIso,
    timeMax: endIso,
    maxResults: String(max),
    singleEvents: "true",
    orderBy: "startTime",
  });
  const resp = await fetch(`${API}/calendars/${calendarId()}/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  if (!resp.ok) throw new Error(`Calendar list ${resp.status}: ${await resp.text()}`);
  const data = (await resp.json()) as { items?: any[] };
  return (data.items || []).map((e) => ({
    id: e.id,
    summary: e.summary || "(no title)",
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    allDay: !e.start?.dateTime,
    location: e.location,
    htmlLink: e.htmlLink,
  }));
}
