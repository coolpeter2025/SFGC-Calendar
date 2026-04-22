"use client";

import { useState } from "react";
import { parseEvent, createEvents } from "@/app/actions";

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

const fieldCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-800 focus:ring-2 focus:ring-brand-800/20";

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
    setEvents((prev) => (prev ? prev.map((e) => (e.uid === uid ? { ...e, ...patch } : e)) : null));
  }

  const selectedCount = events?.filter((e) => e.included).length || 0;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Submit an event
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Paste a single event or a bulk schedule — we&apos;ll parse it and let you review before publishing.
        </p>
      </div>

      {successUrls.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 sm:p-5">
          <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-green-600 text-white">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          <div className="flex-1">
            <div className="font-medium">
              Added {successUrls.length} event{successUrls.length === 1 ? "" : "s"} to the calendar
            </div>
            <a href={successUrls[0]} target="_blank" rel="noreferrer" className="mt-0.5 inline-block text-xs font-medium text-green-800 underline underline-offset-2 hover:text-green-900">
              View on Google Calendar →
            </a>
          </div>
        </div>
      )}

      {skipped.length > 0 && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-500 text-white">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.99-1.743 2.99H3.482c-1.53 0-2.493-1.656-1.743-2.99L8.257 3.099zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="font-medium">
                {skipped.length} line{skipped.length === 1 ? "" : "s"} skipped — need a date
              </div>
              <ul className="mt-2 space-y-1 text-xs text-amber-800">
                {skipped.map((s, i) => (
                  <li key={i} className="rounded-md bg-amber-100/60 px-2 py-1">
                    <span className="font-mono">{s.line}</span>
                    <span className="ml-1 text-amber-700">— {s.reason}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-amber-700">
                Add these manually once the dates are confirmed.
              </p>
            </div>
          </div>
        </div>
      )}

      {!events ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Event details
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={`Single event:\nYouth group Fri Nov 14 at 7pm in Fellowship Hall\n\nOr a bulk schedule:\nApril 5 – Easter (no food)\nApril 12 – Bake Sale\nMay 16 – Men's Breakfast\nOctober 22–25 – Family Retreat`}
                className={`${fieldCls} font-mono text-sm leading-relaxed`}
              />
              <span className="mt-1.5 block text-xs text-slate-500">
                Pastes in any format — one event or a full schedule. Dates without times become all-day events.
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldCls}
                autoComplete="current-password"
              />
            </label>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleParse}
                disabled={loading || !text || !password}
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-6 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-brand-900/10 transition hover:bg-brand-700 active:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Parsing…" : "Preview events"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              {selectedCount} of {events.length} selected
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setEvents(events.map((e) => ({ ...e, included: true })))}
                className="font-medium text-brand-800 hover:underline"
              >
                All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setEvents(events.map((e) => ({ ...e, included: false })))}
                className="font-medium text-slate-500 hover:underline"
              >
                None
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 sm:max-h-[65vh]">
            {events.map((ev) => (
              <div
                key={ev.uid}
                className={`rounded-xl border transition ${
                  ev.included
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3 p-3 sm:p-4">
                  <input
                    type="checkbox"
                    checked={ev.included}
                    onChange={(e) => updateEvent(ev.uid, { included: e.target.checked })}
                    className="mt-2 h-4 w-4 rounded border-slate-300 text-brand-800 focus:ring-brand-800"
                  />
                  <div className="flex-1 space-y-2.5">
                    <input
                      value={ev.title}
                      onChange={(e) => updateEvent(ev.uid, { title: e.target.value })}
                      placeholder="Title"
                      className={`${fieldCls} font-medium`}
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={ev.all_day || false}
                        onChange={(e) => updateEvent(ev.uid, { all_day: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-brand-800 focus:ring-brand-800"
                      />
                      All-day event
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="block text-xs text-slate-500">
                        <span className="mb-1 block">Start</span>
                        <input
                          type={ev.all_day ? "date" : "datetime-local"}
                          value={toLocalInput(ev.start_iso, !!ev.all_day)}
                          onChange={(e) =>
                            updateEvent(ev.uid, { start_iso: fromLocalInput(e.target.value, !!ev.all_day) })
                          }
                          className={fieldCls}
                        />
                      </label>
                      <label className="block text-xs text-slate-500">
                        <span className="mb-1 block">End</span>
                        <input
                          type={ev.all_day ? "date" : "datetime-local"}
                          value={toLocalInput(ev.end_iso, !!ev.all_day)}
                          onChange={(e) =>
                            updateEvent(ev.uid, { end_iso: fromLocalInput(e.target.value, !!ev.all_day) })
                          }
                          className={fieldCls}
                        />
                      </label>
                    </div>
                    <input
                      value={ev.location || ""}
                      onChange={(e) => updateEvent(ev.uid, { location: e.target.value })}
                      placeholder="Location (optional)"
                      className={fieldCls}
                    />
                    {ev.description && (
                      <div className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
                        {ev.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleCreate}
              disabled={loading || selectedCount === 0}
              className="inline-flex items-center justify-center rounded-full bg-brand-800 px-6 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-brand-900/10 transition hover:bg-brand-700 active:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating…" : `Add ${selectedCount} to calendar`}
            </button>
            <button
              onClick={() => {
                setEvents(null);
                setError("");
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
