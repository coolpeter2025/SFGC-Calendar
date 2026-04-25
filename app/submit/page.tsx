"use client";

import { useState } from "react";
import { parseEvent, createEvents } from "@/app/actions";
import { categorize, CATEGORIES } from "@/lib/categories";

interface ParsedEvent {
  title: string;
  start_iso: string;
  end_iso: string;
  all_day?: boolean;
  location?: string;
  description?: string;
  confidence: number;
}

interface EditableEvent extends ParsedEvent {
  included: boolean;
  uid: string;
}

interface SkippedLine {
  line: string;
  reason: string;
}

function toLocalInput(iso: string, allDay: boolean): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (allDay) return datePart;
  return `${datePart}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string, allDay: boolean): string {
  if (!v) return "";
  if (allDay) return new Date(v + "T00:00:00").toISOString();
  return new Date(v).toISOString();
}

function fmtPretty(iso: string, allDay?: boolean) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  if (allDay)
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const fieldStyle: React.CSSProperties = {
  background: "#fbf6ec",
  border: "1px solid rgba(89,75,56,0.18)",
  borderRadius: 10,
  color: "#2a2418",
};

const fieldCls =
  "w-full px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ink-800/20";

const pillBtn: React.CSSProperties = {
  background: "#2a2418",
  color: "#f0d9a8",
  borderRadius: 999,
  boxShadow: "inset 0 0 0 1px rgba(240,217,168,0.18)",
};

export default function SubmitPage() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState<EditableEvent[] | null>(null);
  const [skipped, setSkipped] = useState<SkippedLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successUrls, setSuccessUrls] = useState<string[]>([]);

  async function handleParse() {
    setLoading(true);
    setError("");
    setSuccessUrls([]);
    setSkipped([]);
    try {
      const result = await parseEvent(text, password);
      if (!result.is_event || result.events.length === 0) {
        setError("Couldn't detect any events in that text. Edit and try again.");
        if (result.skipped?.length) setSkipped(result.skipped);
        setLoading(false);
        return;
      }
      setEvents(
        result.events.map((e, i) => ({
          ...e,
          all_day: e.all_day || false,
          included: true,
          uid: `${Date.now()}-${i}`,
        })),
      );
      setSkipped(result.skipped || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!events) return;
    const selected = events.filter((e) => e.included);
    if (selected.length === 0) {
      setError("No events selected.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = selected.map((e) => ({
        title: e.title,
        start_iso: e.start_iso,
        end_iso: e.end_iso,
        all_day: e.all_day,
        location: e.location,
        description: e.description,
      }));
      const urls = await createEvents(payload, password);
      setSuccessUrls(urls);
      setEvents(null);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function updateEvent(uid: string, patch: Partial<EditableEvent>) {
    setEvents((prev) =>
      prev ? prev.map((e) => (e.uid === uid ? { ...e, ...patch } : e)) : null,
    );
  }

  const selectedCount = events?.filter((e) => e.included).length || 0;

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-6">
        <div className="mb-2.5 text-[11px] uppercase tracking-[0.25em] text-ink-400">
          {events ? "Step 2 of 2" : "Step 1 of 2"}
        </div>
        <h1
          className="m-0 font-serif text-[40px] font-normal leading-none tracking-tight text-ink-800 sm:text-[52px]"
          style={{ letterSpacing: "-0.025em" }}
        >
          {events ? (
            <>
              Review your <span className="italic text-ink-500">events</span>
            </>
          ) : (
            <>
              Add an <span className="italic text-ink-500">event</span>
            </>
          )}
        </h1>
        <p className="mt-3.5 max-w-[560px] text-[15px] leading-[1.55] text-ink-500 sm:text-base">
          {events
            ? "Edit anything wrong. Uncheck what you don't want. We'll add the rest to the calendar."
            : "Paste it however you have it — a one-liner from a text, a bullet list, a whole season at once. We'll tidy up the dates and let you review before it lands on the calendar."}
        </p>
      </div>

      {successUrls.length > 0 && (
        <div
          className="mb-5 flex items-start gap-3 rounded-2xl p-4 text-sm sm:p-5"
          style={{
            background: "rgba(21,128,61,0.08)",
            border: "1px solid rgba(21,128,61,0.25)",
            color: "#14532d",
          }}
        >
          <span
            className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full text-white"
            style={{ background: "#15803d" }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div className="flex-1">
            <div className="font-medium">
              Added {successUrls.length} event{successUrls.length === 1 ? "" : "s"} to the
              calendar
            </div>
            <a
              href={successUrls[0]}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-block text-xs font-medium underline underline-offset-2"
            >
              View on Google Calendar →
            </a>
          </div>
        </div>
      )}

      {skipped.length > 0 && (
        <div
          className="mb-5 rounded-2xl p-4 text-sm sm:p-5"
          style={{
            background: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.25)",
            color: "#7c2d12",
          }}
        >
          <div className="font-medium">
            {skipped.length} line{skipped.length === 1 ? "" : "s"} skipped — need a date
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {skipped.map((s, i) => (
              <li
                key={i}
                className="rounded-md px-2 py-1"
                style={{ background: "rgba(217,119,6,0.08)" }}
              >
                <span className="font-mono">{s.line}</span>
                <span className="ml-1 opacity-80">— {s.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!events ? (
        <div
          className="rounded-[18px] border p-1.5"
          style={{
            background: "#fbf6ec",
            borderColor: "rgba(89,75,56,0.18)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
          }}
        >
          <div className="rounded-[14px] bg-white px-6 py-5 sm:px-7 sm:py-6">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                The event(s)
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={9}
                placeholder={`Choir rehearsal Thursday May 14 at 7pm in the Choir Room
Men's Breakfast Sat May 30 8am — Fellowship Hall
Family picnic Saturday May 16, 11am to 3pm at Memorial Park`}
                className="mt-2.5 w-full resize-y px-4 py-4 font-mono text-[13.5px] leading-[1.6] text-ink-800 outline-none"
                style={{
                  background: "#fbf6ec",
                  border: "1px dashed rgba(89,75,56,0.25)",
                  borderRadius: 10,
                  minHeight: 180,
                }}
              />
              <div
                className="mt-2 font-serif text-xs italic"
                style={{ color: "#a8946d" }}
              >
                ✦ Multiple events on separate lines · dates without times become all-day
              </div>
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3.5">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Shared password"
                autoComplete="current-password"
                className="min-w-[200px] flex-1 px-3.5 py-3 text-sm outline-none"
                style={fieldStyle}
              />
              <button
                onClick={handleParse}
                disabled={loading || !text || !password}
                className="px-7 py-3 text-sm font-medium tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50"
                style={pillBtn}
              >
                {loading ? "Parsing…" : "Preview events →"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="mb-3.5 flex items-center justify-between text-[11px] uppercase tracking-[0.25em]"
            style={{ color: "#a8946d" }}
          >
            <span>Preview · {events.length} event{events.length === 1 ? "" : "s"} found</span>
            <span className="flex items-center gap-3 text-[12px] normal-case tracking-normal">
              <button
                onClick={() => setEvents(events.map((e) => ({ ...e, included: true })))}
                className="font-medium text-ink-700 hover:underline"
              >
                All
              </button>
              <span className="text-ink-400">|</span>
              <button
                onClick={() => setEvents(events.map((e) => ({ ...e, included: false })))}
                className="font-medium text-ink-500 hover:underline"
              >
                None
              </button>
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {events.map((ev) => {
              const cat = CATEGORIES[categorize(ev.title)];
              return (
                <details
                  key={ev.uid}
                  className="rounded-[14px] bg-white"
                  style={{
                    border: "1px solid rgba(89,75,56,0.18)",
                    opacity: ev.included ? 1 : 0.55,
                  }}
                >
                  <summary
                    className="grid cursor-pointer items-center gap-3 px-5 py-4"
                    style={{ gridTemplateColumns: "auto 1fr auto auto" }}
                  >
                    <input
                      type="checkbox"
                      checked={ev.included}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateEvent(ev.uid, { included: e.target.checked })
                      }
                      className="h-[18px] w-[18px]"
                      style={{ accentColor: "#2a2418" }}
                    />
                    <div>
                      <div className="flex items-center gap-2.5 font-serif text-[19px] font-medium text-ink-800">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: cat.dot }}
                        />
                        {ev.title || "(untitled)"}
                      </div>
                      <div
                        className="mt-1 font-serif text-[13px] italic text-ink-500"
                      >
                        {fmtPretty(ev.start_iso, ev.all_day)}
                        {ev.location ? ` · ${ev.location}` : ""}
                      </div>
                    </div>
                    <div
                      className="rounded-full px-2.5 py-1 text-[11px]"
                      style={{
                        background: "#fbf6ec",
                        color: cat.color,
                        border: `1px solid ${cat.color}30`,
                      }}
                    >
                      {cat.label}
                    </div>
                    <span className="text-[13px] text-ink-400">edit</span>
                  </summary>

                  <div
                    className="space-y-3 border-t px-5 pb-5 pt-4"
                    style={{ borderColor: "rgba(89,75,56,0.12)" }}
                  >
                    <input
                      value={ev.title}
                      onChange={(e) => updateEvent(ev.uid, { title: e.target.value })}
                      placeholder="Title"
                      className={`${fieldCls} font-medium`}
                      style={fieldStyle}
                    />
                    <label className="flex items-center gap-2 text-xs text-ink-500">
                      <input
                        type="checkbox"
                        checked={ev.all_day || false}
                        onChange={(e) =>
                          updateEvent(ev.uid, { all_day: e.target.checked })
                        }
                        className="h-3.5 w-3.5"
                        style={{ accentColor: "#2a2418" }}
                      />
                      All-day event
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="block text-xs text-ink-500">
                        <span className="mb-1 block">Start</span>
                        <input
                          type={ev.all_day ? "date" : "datetime-local"}
                          value={toLocalInput(ev.start_iso, !!ev.all_day)}
                          onChange={(e) =>
                            updateEvent(ev.uid, {
                              start_iso: fromLocalInput(e.target.value, !!ev.all_day),
                            })
                          }
                          className={fieldCls}
                          style={fieldStyle}
                        />
                      </label>
                      <label className="block text-xs text-ink-500">
                        <span className="mb-1 block">End</span>
                        <input
                          type={ev.all_day ? "date" : "datetime-local"}
                          value={toLocalInput(ev.end_iso, !!ev.all_day)}
                          onChange={(e) =>
                            updateEvent(ev.uid, {
                              end_iso: fromLocalInput(e.target.value, !!ev.all_day),
                            })
                          }
                          className={fieldCls}
                          style={fieldStyle}
                        />
                      </label>
                    </div>
                    <input
                      value={ev.location || ""}
                      onChange={(e) => updateEvent(ev.uid, { location: e.target.value })}
                      placeholder="Location (optional)"
                      className={fieldCls}
                      style={fieldStyle}
                    />
                    {ev.description && (
                      <div
                        className="rounded-md px-2 py-1 text-xs text-ink-500"
                        style={{ background: "#fbf6ec" }}
                      >
                        {ev.description}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleCreate}
              disabled={loading || selectedCount === 0}
              className="inline-flex items-center justify-center px-8 py-3.5 text-[14.5px] font-medium tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
              style={pillBtn}
            >
              {loading
                ? "Adding…"
                : `Add ${selectedCount} event${selectedCount === 1 ? "" : "s"} to calendar`}
            </button>
            <button
              onClick={() => {
                setEvents(null);
                setError("");
              }}
              className="inline-flex items-center justify-center rounded-full border bg-white px-6 py-3 text-sm font-medium text-ink-700"
              style={{ borderColor: "rgba(89,75,56,0.25)" }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-5 rounded-xl p-3 text-sm"
          style={{
            background: "rgba(190,18,60,0.06)",
            border: "1px solid rgba(190,18,60,0.25)",
            color: "#7f1d1d",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
