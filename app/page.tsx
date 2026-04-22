import { listInRange } from "@/lib/google";
import CalendarView, { type FCEvent } from "./CalendarView";

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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Couldn&apos;t load calendar: {(err as Error).message}
      </div>
    );
  }

  const fcEvents: FCEvent[] = events.map((e) => ({
    id: e.id,
    title: e.summary,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    url: e.htmlLink,
    extendedProps: { location: e.location },
  }));

  return <CalendarView events={fcEvents} />;
}
