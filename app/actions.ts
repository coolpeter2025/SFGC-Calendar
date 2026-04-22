"use server";

import { parseEventsText, type ParsedEvents } from "@/lib/claude";
import { createEvent as createCalendarEvent, type EventData } from "@/lib/google";

function checkPassword(password: string) {
  if (!process.env.SUBMIT_PASSWORD || password !== process.env.SUBMIT_PASSWORD) {
    throw new Error("Invalid password");
  }
}

export async function parseEvent(text: string, password: string): Promise<ParsedEvents> {
  checkPassword(password);
  if (!text.trim()) throw new Error("Text is required");
  return parseEventsText(text);
}

export async function createEvents(events: EventData[], password: string): Promise<string[]> {
  checkPassword(password);
  if (events.length === 0) throw new Error("No events to create");
  const urls: string[] = [];
  for (const ev of events) {
    if (!ev.title || !ev.start_iso || !ev.end_iso) {
      throw new Error(`Event is missing required fields`);
    }
    urls.push(await createCalendarEvent(ev));
  }
  return urls;
}
