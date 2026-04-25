import { listInRange } from "@/lib/google";
import CalendarView from "./CalendarView";
import Hero from "./Hero";
import type { Ev } from "./types";

export const revalidate = 60;

export default async function HomePage() {
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setMonth(rangeStart.getMonth() - 2);
  const rangeEnd = new Date(now);
  rangeEnd.setMonth(rangeEnd.getMonth() + 12);

  let events;
  try {
    events = await listInRange(rangeStart.toISOString(), rangeEnd.toISOString());
  } catch (err) {
    return (
      <div
        className="rounded-2xl border p-5 text-sm"
        style={{
          borderColor: "rgba(190,18,60,0.25)",
          background: "rgba(190,18,60,0.06)",
          color: "#7f1d1d",
        }}
      >
        <div className="font-medium">Couldn&apos;t load the calendar</div>
        <div className="mt-1 opacity-80">{(err as Error).message}</div>
      </div>
    );
  }

  const all: Ev[] = events.map((e) => ({
    id: e.id,
    title: e.summary,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    url: e.htmlLink,
    location: e.location,
  }));

  return (
    <>
      <Hero events={all} />
      <CalendarView events={all} />
    </>
  );
}
