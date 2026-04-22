import Anthropic from "@anthropic-ai/sdk";
import type { EventData } from "./google";

export interface ParsedEvent extends EventData {
  is_event: boolean;
  confidence: number;
}

export async function parseEventText(text: string): Promise<ParsedEvent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const tz = process.env.TIMEZONE || "America/New_York";
  const now = new Date().toISOString();

  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tool_choice: { type: "tool", name: "extract_event" },
    tools: [
      {
        name: "extract_event",
        description:
          "Extract a calendar event from freeform text submitted by church staff. Set is_event=false for messages that aren't actually an event.",
        input_schema: {
          type: "object",
          required: ["is_event", "confidence", "title", "start_iso", "end_iso"],
          properties: {
            is_event: { type: "boolean" },
            confidence: {
              type: "number",
              description: "0-1 confidence this is a real event announcement",
            },
            title: { type: "string", description: "short calendar title" },
            start_iso: {
              type: "string",
              description: `ISO 8601 start with offset, default timezone ${tz}`,
            },
            end_iso: {
              type: "string",
              description: "ISO 8601 end; default 1h after start if unspecified",
            },
            location: { type: "string" },
            description: { type: "string", description: "original text or cleaned-up details" },
          },
        },
      },
    ],
    system: `Current UTC time: ${now}. Default timezone: ${tz}. Extract a single church calendar event.`,
    messages: [{ role: "user", content: text }],
  });

  const tool = resp.content.find((c) => c.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("Claude did not return a tool call");
  return tool.input as ParsedEvent;
}
