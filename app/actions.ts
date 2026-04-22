"use server";

import { parseEventText, type ParsedEvent } from "@/lib/claude";
import { createEvent as createCalendarEvent, type EventData } from "@/lib/google";

function checkPassword(password: string) {
  if (!process.env.SUBMIT_PASSWORD || password !== process.env.SUBMIT_PASSWORD) {
    throw new Error("Invalid password");
  }
}

export async function parseEvent(text: string, password: string): Promise<ParsedEvent> {
  checkPassword(password);
  if (!text.trim()) throw new Error("Text is required");
  return parseEventText(text);
}

export async function createEvent(data: EventData, password: string): Promise<string> {
  checkPassword(password);
  if (!data.title || !data.start_iso || !data.end_iso) {
    throw new Error("Title, start, and end are required");
  }
  return createCalendarEvent(data);
}
