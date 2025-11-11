import { NextRequest } from "next/server";

export type StreamChunk = string | Uint8Array;

export function sseHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    ...extra,
  } as Record<string, string>;
}

export async function sseFromGenerator(gen: AsyncGenerator<StreamChunk, void, void>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await gen.next();
      if (done) {
        controller.enqueue(encoder.encode("event: end\n\n"));
        controller.close();
        return;
      }
      const payload = typeof value === "string" ? encoder.encode(value) : value;
      controller.enqueue(payload);
    },
  });
  return stream;
}

export function event(data: unknown, eventName?: string) {
  const payload = JSON.stringify(data);
  const name = eventName ? `event: ${eventName}\n` : "";
  return `${name}data: ${payload}\n\n`;
}

export function heartBeat() {
  return `:\n\n`;
}

export function requireEnv(key: string, req: NextRequest) {
  const v = process.env[key];
  if (!v || v.trim() === "") {
    return {
      ok: false,
      error: `Missing environment variable ${key}. Configure provider keys before streaming.`,
      requestId: req.headers.get("x-request-id") || undefined,
    } as const;
  }
  return { ok: true, value: v } as const;
}