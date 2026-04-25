"use client";

import { useMemo, useState } from "react";
import { categorize, CATEGORIES, type Category } from "@/lib/categories";
import type { Ev } from "./types";

const fmtTime = (d: Date) => {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2, "0")}${ap}`;
};
const fmtMonth = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long" });
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
function monthGrid(monthDate: Date) {
  const first = startOfMonth(monthDate);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

interface DecoratedEv {
  raw: Ev;
  start: Date;
  cat: Category;
}

export default function CalendarView({ events }: { events: Ev[] }) {
  const today = useMemo(() => new Date(), []);
  const [monthDate, setMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [activeCats, setActiveCats] = useState<Set<Category>>(
    new Set(Object.keys(CATEGORIES) as Category[]),
  );

  const decorated: DecoratedEv[] = useMemo(
    () =>
      events.map((e) => ({
        raw: e,
        start: new Date(e.start),
        cat: categorize(e.title),
      })),
    [events],
  );

  const cells = monthGrid(monthDate);

  const eventsOnDay = (day: Date) =>
    decorated
      .filter((e) => sameDay(e.start, day) && activeCats.has(e.cat))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <section
      className="mb-8 rounded-[18px] border bg-cream-50 px-5 py-6 sm:px-7"
      style={{ borderColor: "rgba(89,75,56,0.18)" }}
    >
      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3.5">
          <h2
            className="m-0 font-serif text-[28px] font-normal tracking-tight text-ink-800 sm:text-[36px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            {fmtMonth(monthDate)}
            <span className="ml-2 italic" style={{ color: "#a8946d" }}>
              {monthDate.getFullYear()}
            </span>
          </h2>
          <div className="flex gap-1">
            <IconBtn
              onClick={() =>
                setMonth(
                  new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1),
                )
              }
              ariaLabel="Previous month"
            >
              ‹
            </IconBtn>
            <IconBtn
              onClick={() =>
                setMonth(
                  new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
                )
              }
              ariaLabel="Next month"
            >
              ›
            </IconBtn>
            <IconBtn
              onClick={() =>
                setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
              }
              wide
              italic
            >
              today
            </IconBtn>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][])
            .map(([k, c]) => {
              const on = activeCats.has(k);
              return (
                <button
                  key={k}
                  onClick={() => {
                    const next = new Set(activeCats);
                    if (on) next.delete(k);
                    else next.add(k);
                    setActiveCats(next);
                  }}
                  className="flex items-center gap-[7px] rounded-full px-3 py-1 text-[12px]"
                  style={{
                    background: on ? "#fff" : "transparent",
                    border: `1px solid ${
                      on ? "rgba(89,75,56,0.25)" : "rgba(89,75,56,0.12)"
                    }`,
                    color: on ? "#3f3525" : "#a8946d",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: on ? c.dot : "transparent",
                      border: on ? "none" : `1px solid ${c.dot}`,
                    }}
                  />
                  {c.label}
                </button>
              );
            })}
        </div>
      </div>

      {/* weekday header */}
      <div className="mb-1.5 grid grid-cols-7">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="pb-2 text-center font-serif text-[12.5px] italic"
            style={{ color: "#a8946d", letterSpacing: "0.05em" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* grid */}
      <div
        className="grid grid-cols-7 overflow-hidden rounded-[10px] border bg-white"
        style={{ borderColor: "rgba(89,75,56,0.15)" }}
      >
        {cells.map((d, i) => {
          const isOtherMonth = d.getMonth() !== monthDate.getMonth();
          const isToday = sameDay(d, today);
          const dayEvents = eventsOnDay(d);
          return (
            <div
              key={i}
              className="relative px-2 py-2"
              style={{
                minHeight: 110,
                borderRight:
                  i % 7 !== 6 ? "1px solid rgba(89,75,56,0.10)" : "none",
                borderTop: i >= 7 ? "1px solid rgba(89,75,56,0.10)" : "none",
                background: isToday
                  ? "#fcf3df"
                  : isOtherMonth
                    ? "#fbf6ec"
                    : "#fff",
                opacity: isOtherMonth ? 0.5 : 1,
              }}
            >
              <div
                className="mb-1 flex items-center gap-1.5 font-serif text-[15px]"
                style={{
                  color: isToday ? "#2a2418" : "#7a6b50",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {isToday ? (
                  <span
                    className="grid h-[22px] w-[22px] place-items-center rounded-full text-[12px]"
                    style={{ background: "#2a2418", color: "#f0d9a8" }}
                  >
                    {d.getDate()}
                  </span>
                ) : (
                  d.getDate()
                )}
              </div>
              <div className="flex flex-col gap-[3px]">
                {dayEvents.slice(0, 3).map((e) => (
                  <a
                    key={e.raw.id}
                    href={e.raw.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-baseline gap-[5px] overflow-hidden whitespace-nowrap text-[11.5px] text-ink-700"
                    title={`${e.raw.title}${e.raw.location ? " — " + e.raw.location : ""}`}
                  >
                    <span
                      className="h-[5px] w-[5px] flex-none rounded-full"
                      style={{
                        background: CATEGORIES[e.cat].dot,
                        transform: "translateY(-1px)",
                      }}
                    />
                    {!e.raw.allDay && (
                      <span
                        className="tabular-nums"
                        style={{ color: "#a8946d" }}
                      >
                        {fmtTime(e.start)}
                      </span>
                    )}
                    <span className="overflow-hidden text-ellipsis">
                      {e.raw.title}
                    </span>
                  </a>
                ))}
                {dayEvents.length > 3 && (
                  <div
                    className="font-serif text-[11px] italic"
                    style={{ color: "#a8946d" }}
                  >
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function IconBtn({
  onClick,
  children,
  wide,
  italic,
  ariaLabel,
}: {
  onClick: () => void;
  children: React.ReactNode;
  wide?: boolean;
  italic?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid place-items-center rounded-lg bg-white text-ink-700"
      style={{
        height: 32,
        width: wide ? "auto" : 32,
        padding: wide ? "0 14px" : 0,
        border: "1px solid rgba(89,75,56,0.20)",
        fontSize: 16,
        fontFamily: italic ? "var(--font-fraunces), Georgia, serif" : "inherit",
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {children}
    </button>
  );
}
