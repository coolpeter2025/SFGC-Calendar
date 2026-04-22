"use client";

import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

export interface FCEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  url: string;
  extendedProps?: { location?: string };
}

export default function CalendarView({ events }: { events: FCEvent[] }) {
  const ref = useRef<FullCalendar>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const applyView = () => {
      const api = ref.current?.getApi();
      if (!api) return;
      const target = mq.matches ? "listMonth" : "dayGridMonth";
      if (api.view.type !== target) api.changeView(target);
    };
    applyView();
    mq.addEventListener("change", applyView);
    return () => mq.removeEventListener("change", applyView);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <FullCalendar
        ref={ref}
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listMonth",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          list: "List",
        }}
        events={events}
        height="auto"
        eventDisplay="block"
        dayMaxEventRows={3}
        fixedWeekCount={false}
        eventDidMount={(info) => {
          info.el.style.cursor = "pointer";
          const loc = info.event.extendedProps?.location;
          if (loc) info.el.title = `${info.event.title} — ${loc}`;
        }}
        eventClick={(info) => {
          if (info.event.url) {
            info.jsEvent.preventDefault();
            window.open(info.event.url, "_blank", "noopener,noreferrer");
          }
        }}
        noEventsContent={() => (
          <div className="py-10 text-center text-sm text-slate-400">
            No events this month
          </div>
        )}
      />
    </div>
  );
}
