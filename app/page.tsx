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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <div className="font-medium">Couldn&apos;t load the calendar</div>
        <div className="mt-1 text-red-700/80">{(err as Error).message}</div>
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

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Events
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Services, ministries, and gatherings at SFGC
        </p>
      </div>
      <CalendarView events={fcEvents} />
    </div>
  );
}
