import Anthropic from "@anthropic-ai/sdk";
import type { EventData } from "./google";

export interface ParsedEvent extends EventData {
  confidence: number;
}

export interface ParsedEvents {
  is_event: boolean;
  events: ParsedEvent[];
}

export async function parseEventsText(text: string): Promise<ParsedEvents> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const tz = process.env.TIMEZONE || "America/New_York";
  const now = new Date().toISOString();

  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    tool_choice: { type: "tool", name: "extract_events" },
    tools: [
      {
        name: "extract_events",
        description:
          "Extract one or more calendar events from a text submission. A single event message yields one event. A schedule (e.g. 'Women's Ministry: April 19, May 10, June 20') yields multiple events sharing a title.",
        input_schema: {
          type: "object",
          required: ["is_event", "events"],
          properties: {
            is_event: {
              type: "boolean",
              description: "true if any valid events were detected",
            },
            events: {
              type: "array",
              items: {
                type: "object",
                required: ["title", "start_iso", "end_iso", "confidence"],
                properties: {
                  title: {
                    type: "string",
                    description:
                      "calendar title; for bulk schedules use the shared group name (e.g. 'Women's Ministry')",
                  },
                  start_iso: {
                    type: "string",
                    description: `ISO 8601 start; for all-day events use YYYY-MM-DDT00:00:00 in ${tz}`,
                  },
                  end_iso: {
                    type: "string",
                    description:
                      "ISO 8601 end; if time given default to 1h after start; if all-day default to same day 23:59:59",
                  },
                  all_day: {
                    type: "boolean",
                    description: "true when the source text gives no specific clock time",
                  },
                  location: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number", description: "0-1" },
                },
              },
            },
          },
        },
      },
    ],
    system: `Current UTC time: ${now}. Default timezone: ${tz}.

Extract calendar events for a church. The input can be:
- A single event description ("Youth group meeting Friday Nov 14 at 7pm in Fellowship Hall")
- A bulk schedule listing multiple dates under one theme/ministry name

Rules:
1. Bulk schedules: if the text names an event/ministry then lists multiple dates, output one event per date, all sharing the same title and (if given) location.
2. Year inference: if a date has no year, assume the earliest year that is >= today. Example: if today is April 21 and the text says "April 19", that's April 19 of next year.
3. If no clock time is given, set all_day=true.
4. If a clock time IS given but no end time, default end to 1 hour after start.
`,
    messages: [{ role: "user", content: text }],
  });

  const tool = resp.content.find((c) => c.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("Claude did not return a tool call");
  return tool.input as ParsedEvents;
}
