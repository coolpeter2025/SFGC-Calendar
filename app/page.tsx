import { listUpcoming } from "@/lib/google";

export const revalidate = 60;

const tz = process.env.TIMEZONE || "America/New_York";

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function HomePage() {
  let events;
  try {
    events = await listUpcoming(25);
  } catch (err) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Couldn&apos;t load calendar: {(err as Error).message}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Upcoming events</h1>
      {events.length === 0 ? (
        <p className="text-slate-500">No upcoming events.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-lg border bg-white p-4 transition hover:shadow-sm">
              <a href={e.htmlLink} target="_blank" rel="noreferrer" className="block">
                <div className="font-medium">{e.summary}</div>
                <div className="mt-1 text-sm text-slate-600">{fmt(e.start)}</div>
                {e.location && (
                  <div className="mt-1 text-sm text-slate-500">{e.location}</div>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
