import Anthropic from "@anthropic-ai/sdk";
import type { EventData } from "./google";

export interface ParsedEvent extends EventData {
  confidence: number;
}

export interface SkippedLine {
  line: string;
  reason: string;
}

export interface ParsedEvents {
  is_event: boolean;
  events: ParsedEvent[];
  skipped?: SkippedLine[];
}

export async function parseEventsText(text: string): Promise<ParsedEvents> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const tz = process.env.TIMEZONE || "America/New_York";
  const now = new Date().toISOString();

  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    tool_choice: { type: "tool", name: "extract_events" },
    tools: [
      {
        name: "extract_events",
        description:
          "Extract calendar events from a free-form church schedule. Each line of a list is typically its own event. Skip undated entries (like '(TBD)') into the skipped array.",
        input_schema: {
          type: "object",
          required: ["is_event", "events"],
          properties: {
            is_event: { type: "boolean", description: "true if any event was detected" },
            events: {
              type: "array",
              items: {
                type: "object",
                required: ["title", "start_iso", "end_iso", "confidence"],
                properties: {
                  title: {
                    type: "string",
                    description:
                      "calendar title, taken from the line itself; strip parenthetical notes from the title",
                  },
                  start_iso: {
                    type: "string",
                    description: `ISO 8601 start; all-day events use YYYY-MM-DDT00:00:00 in ${tz}`,
                  },
                  end_iso: {
                    type: "string",
                    description:
                      "ISO 8601 end; for all-day single-day use same date 23:59:59, for date ranges use the last day 23:59:59, for timed events default to 1h after start",
                  },
                  all_day: {
                    type: "boolean",
                    description: "true when no clock time is given or for date ranges",
                  },
                  location: { type: "string" },
                  description: {
                    type: "string",
                    description:
                      "include parenthetical notes like '(no food)', '(menu)', and other source hints here",
                  },
                  confidence: {
                    type: "number",
                    description:
                      "0-1; lower when date/range is fuzzy (e.g. 'June-July (9 weeks)')",
                  },
                },
              },
            },
            skipped: {
              type: "array",
              description: "lines that look like events but cannot be dated — e.g. '(TBD)'",
              items: {
                type: "object",
                required: ["line", "reason"],
                properties: {
                  line: { type: "string", description: "the original source line" },
                  reason: { type: "string", description: "why it was skipped" },
                },
              },
            },
          },
        },
      },
    ],
    system: `Current UTC time: ${now}. Default timezone: ${tz}.

You extract calendar events for a church. Input can be a single event, a bulk schedule with a shared title, or a heterogeneous list where each line is its own event.

RULES:

1. **Each line = one event** unless the text explicitly declares a shared title for all dates (e.g. "Women's Ministry: April 19, May 10, June 20"). In that case produce one event per date, all sharing the title.

2. **Title extraction**: take the event name from the line. Strip parenthetical notes like "(no food)", "(menu)" — those go into the description, not the title. For lines like "April 5 – Easter (no food)", title = "Easter", description includes "no food".

3. **Year inference**: if year is missing, use the earliest year such that the date is >= today. Example: today is April 21, "April 5" → next year's April 5.

4. **Clock time**:
   - No clock time → all_day=true; start = date 00:00 local, end = same date 23:59 local.
   - Clock time given → all_day=false; if no explicit end, default end to 1 hour after start.

5. **Date ranges** ("October 22-25", "June 1 – June 8"):
   - ONE event, all_day=true.
   - start_iso = first day 00:00 local, end_iso = last day 23:59 local.

6. **Fuzzy / multi-week spans** ("June–July (9 weeks) – Kids Camp"):
   - ONE event, all_day=true, best-effort span; confidence ≤ 0.5 so user knows to review.

7. **TBD / undated entries** ("(TBD) – Music Night", "Music Night - TBD"):
   - DO NOT put in events[]. Add to skipped[] with reason "No date specified".

8. **Header / section lines** that aren't events ("Annual Schedule", blank lines, divider text): ignore silently.
`,
    messages: [{ role: "user", content: text }],
  });

  const tool = resp.content.find((c) => c.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("Claude did not return a tool call");
  return tool.input as ParsedEvents;
}
