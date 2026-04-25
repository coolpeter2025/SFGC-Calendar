import { categorize, CATEGORIES } from "@/lib/categories";
import type { Ev } from "./types";

const fmtTime = (d: Date) => {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2, "0")}${ap}`;
};
const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long" });
const fmtDayShort = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short" });

function ordinalSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function nextSunday(from: Date) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const diff = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function weekRangeLabel(from: Date) {
  const start = new Date(from);
  const end = new Date(from);
  end.setDate(end.getDate() + 6);
  const sM = start.toLocaleDateString("en-US", { month: "long" });
  const eM = end.toLocaleDateString("en-US", { month: "long" });
  if (sM === eM) return `${sM} ${start.getDate()} – ${end.getDate()}`;
  return `${sM} ${start.getDate()} – ${eM} ${end.getDate()}`;
}

export default function Hero({ events }: { events: Ev[] }) {
  const now = new Date();
  const sun = nextSunday(now);
  const sundayEvents = events
    .map((e) => ({ ...e, _start: new Date(e.start) }))
    .filter((e) => sameDay(e._start, sun))
    .sort((a, b) => a._start.getTime() - b._start.getTime());

  const upcoming = events
    .map((e) => ({ ...e, _start: new Date(e.start) }))
    .filter((e) => e._start.getTime() >= now.getTime() - 24 * 3600 * 1000)
    .sort((a, b) => a._start.getTime() - b._start.getTime())
    .slice(0, 6);

  return (
    <section className="mb-7 grid gap-6 md:grid-cols-[1.05fr_1fr]">
      {/* This Sunday */}
      <div
        className="relative overflow-hidden rounded-[18px] px-7 pb-7 pt-8 text-cream-100 sm:px-8"
        style={{ background: "#2a2418" }}
      >
        <svg
          width="180"
          height="220"
          viewBox="0 0 180 220"
          className="pointer-events-none absolute -bottom-10 -right-7 opacity-20"
        >
          <path
            d="M30 220 V90 a60 60 0 0 1 120 0 V220"
            fill="none"
            stroke="#f0d9a8"
            strokeWidth="1.5"
          />
          <path
            d="M50 220 V100 a40 40 0 0 1 80 0 V220"
            fill="none"
            stroke="#f0d9a8"
            strokeWidth="1"
          />
          <line x1="90" y1="60" x2="90" y2="220" stroke="#f0d9a8" strokeWidth="0.5" />
        </svg>
        <div
          className="mb-3.5 text-[11px] uppercase tracking-[0.25em]"
          style={{ color: "#d4b878" }}
        >
          {sameDay(sun, now) ? "Today · Sunday" : "This Sunday"}
        </div>
        <div
          className="mb-4 font-serif text-[56px] font-normal leading-[0.95] tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {fmtDay(sun).slice(0, 3)}
          <span className="font-light italic" style={{ color: "#f0d9a8" }}>
            {" "}
            the{" "}
          </span>
          {sun.getDate()}
          <sup
            className="ml-0.5 italic"
            style={{ fontSize: 22, color: "#d4b878" }}
          >
            {ordinalSuffix(sun.getDate())}
          </sup>
        </div>
        <div className="relative z-[1] flex flex-col gap-2.5">
          {sundayEvents.length === 0 ? (
            <div
              className="font-serif text-[18px] italic"
              style={{ color: "#d4b878" }}
            >
              Nothing scheduled
            </div>
          ) : (
            sundayEvents.map((e) => (
              <a
                key={e.id}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-baseline gap-4 border-b pb-2.5"
                style={{ borderColor: "rgba(240,217,168,0.18)" }}
              >
                <div
                  className="w-[60px] font-serif italic"
                  style={{ color: "#d4b878", fontSize: 18 }}
                >
                  {e.allDay ? "all day" : fmtTime(e._start)}
                </div>
                <div className="font-serif text-[22px] font-normal">{e.title}</div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* This Week */}
      <div
        className="rounded-[18px] border bg-cream-50 px-7 pb-5 pt-6 sm:px-7"
        style={{ borderColor: "rgba(89,75,56,0.18)" }}
      >
        <div className="mb-4 flex items-baseline justify-between">
          <div className="text-[11px] uppercase tracking-[0.25em] text-ink-500">
            This week
          </div>
          <div className="font-serif text-[13px] italic text-ink-500">
            {weekRangeLabel(now)}
          </div>
        </div>
        <div className="flex flex-col">
          {upcoming.length === 0 ? (
            <div className="py-3 text-sm italic text-ink-500">
              No upcoming events
            </div>
          ) : (
            upcoming.map((e, i) => {
              const cat = CATEGORIES[categorize(e.title)];
              return (
                <a
                  key={e.id}
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid items-baseline gap-3.5 py-3"
                  style={{
                    gridTemplateColumns: "44px 1fr auto",
                    borderBottom:
                      i < upcoming.length - 1
                        ? "1px dotted rgba(89,75,56,0.25)"
                        : "none",
                  }}
                >
                  <div className="font-serif text-[13px] text-ink-500">
                    {fmtDayShort(e._start)} {e._start.getDate()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[14.5px] font-medium text-ink-800">
                      <span
                        className="h-[7px] w-[7px] flex-none rounded-full"
                        style={{ background: cat.dot }}
                      />
                      <span className="truncate">{e.title}</span>
                    </div>
                    {e.location && (
                      <div className="mt-0.5 text-[12.5px] text-ink-500">
                        {e.location}
                      </div>
                    )}
                  </div>
                  <div className="font-serif text-[13px] italic text-ink-700">
                    {e.allDay ? "all day" : fmtTime(e._start)}
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
