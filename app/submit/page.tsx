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
      <h1 className="mb-2 text-2xl font-bold">Submit event(s)</h1>
      <p className="mb-6 text-sm text-slate-600">
        Paste a single event or a bulk schedule. Each event can be reviewed and edited before adding.
      </p>

      {successUrls.length > 0 && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Added {successUrls.length} event{successUrls.length === 1 ? "" : "s"} to the calendar.{" "}
          <a href={successUrls[0]} target="_blank" rel="noreferrer" className="font-medium underline">
            View first one
          </a>
        </div>
      )}

      {skipped.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 font-medium">
            {skipped.length} line{skipped.length === 1 ? "" : "s"} skipped — needs a date:
          </div>
          <ul className="list-disc space-y-1 pl-5">
            {skipped.map((s, i) => (
              <li key={i}>
                <span className="font-mono">{s.line}</span>
                <span className="text-amber-700"> — {s.reason}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-amber-700">
            Add these manually once dates are confirmed.
          </div>
        </div>
      )}

      {!events ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Paste event details</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={`Single:\nYouth group Friday Nov 14 at 7pm in Fellowship Hall\n\nBulk:\nWomen's Ministry - Annual Schedule\nApril 19\nMay 10\nJune 20`}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            />
          </label>
          <button
            onClick={handleParse}
            disabled={loading || !text || !password}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Parsing…" : "Preview"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedCount} of {events.length} selected
            </span>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setEvents(events.map((e) => ({ ...e, included: true })))}
                className="text-blue-600 hover:underline"
              >
                Select all
              </button>
              <span className="text-slate-400">·</span>
              <button
                onClick={() => setEvents(events.map((e) => ({ ...e, included: false })))}
                className="text-blue-600 hover:underline"
              >
                Select none
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {events.map((ev) => (
              <div
                key={ev.uid}
                className={`rounded-lg border bg-white p-4 ${ev.included ? "" : "opacity-50"}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={ev.included}
                    onChange={(e) => updateEvent(ev.uid, { included: e.target.checked })}
                    className="mt-2"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      value={ev.title}
                      onChange={(e) => updateEvent(ev.uid, { title: e.target.value })}
                      placeholder="Title"
                      className="w-full rounded-md border border-slate-300 p-2 text-sm font-medium"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={ev.all_day || false}
                        onChange={(e) => updateEvent(ev.uid, { all_day: e.target.checked })}
                      />
                      All-day
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="block text-xs text-slate-600">
                        Start
                        <input
                          type={ev.all_day ? "date" : "datetime-local"}
                          value={toLocalInput(ev.start_iso, !!ev.all_day)}
                          onChange={(e) =>
                            updateEvent(ev.uid, { start_iso: fromLocalInput(e.target.value, !!ev.all_day) })
                          }
                          className="mt-0.5 w-full rounded-md border border-slate-300 p-1.5 text-sm"
                        />
                      </label>
                      <label className="block text-xs text-slate-600">
                        End
                        <input
                          type={ev.all_day ? "date" : "datetime-local"}
                          value={toLocalInput(ev.end_iso, !!ev.all_day)}
                          onChange={(e) =>
                            updateEvent(ev.uid, { end_iso: fromLocalInput(e.target.value, !!ev.all_day) })
                          }
                          className="mt-0.5 w-full rounded-md border border-slate-300 p-1.5 text-sm"
                        />
                      </label>
                    </div>
                    <input
                      value={ev.location || ""}
                      onChange={(e) => updateEvent(ev.uid, { location: e.target.value })}
                      placeholder="Location (optional)"
                      className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading || selectedCount === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating…" : `Add ${selectedCount} to Calendar`}
            </button>
            <button
              onClick={() => {
                setEvents(null);
                setError("");
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
