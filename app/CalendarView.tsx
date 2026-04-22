"use client";

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
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm sm:p-5">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listMonth",
        }}
        events={events}
        height="auto"
        eventDisplay="block"
        dayMaxEventRows={3}
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
      />
    </div>
  );
}
