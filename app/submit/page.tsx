"use client";

import { useState } from "react";
import { parseEvent, createEvent } from "@/app/actions";

interface Parsed {
  is_event: boolean;
  confidence: number;
  title: string;
  start_iso: string;
  end_iso: string;
  location?: string;
  description?: string;
}

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string {
  return v ? new Date(v).toISOString() : "";
}

export default function SubmitPage() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successUrl, setSuccessUrl] = useState("");

  async function handleParse() {
    setLoading(true);
    setError("");
    setSuccessUrl("");
    try {
      const p = await parseEvent(text, password);
      if (!p.is_event || p.confidence < 0.4) {
        setError(
          `Doesn't look like an event (confidence ${Math.round(p.confidence * 100)}%). You can still edit and submit below.`,
        );
      }
      setParsed(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!parsed) return;
    setLoading(true);
    setError("");
    try {
      const link = await createEvent(
        {
          title: parsed.title,
          start_iso: parsed.start_iso,
          end_iso: parsed.end_iso,
          location: parsed.location,
          description: parsed.description,
        },
        password,
      );
      setSuccessUrl(link);
      setParsed(null);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Submit an event</h1>

      {successUrl && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Event created.{" "}
          <a href={successUrl} target="_blank" rel="noreferrer" className="font-medium underline">
            View on Google Calendar
          </a>
        </div>
      )}

      {!parsed ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Paste event details</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="e.g. Youth group meeting, Friday Nov 14 at 7pm in Fellowship Hall"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
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
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              value={parsed.title}
              onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Start</span>
              <input
                type="datetime-local"
                value={toLocalInput(parsed.start_iso)}
                onChange={(e) => setParsed({ ...parsed, start_iso: fromLocalInput(e.target.value) })}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">End</span>
              <input
                type="datetime-local"
                value={toLocalInput(parsed.end_iso)}
                onChange={(e) => setParsed({ ...parsed, end_iso: fromLocalInput(e.target.value) })}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Location</span>
            <input
              value={parsed.location || ""}
              onChange={(e) => setParsed({ ...parsed, location: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <textarea
              value={parsed.description || ""}
              onChange={(e) => setParsed({ ...parsed, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            />
          </label>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Add to Calendar"}
            </button>
            <button
              onClick={() => {
                setParsed(null);
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
