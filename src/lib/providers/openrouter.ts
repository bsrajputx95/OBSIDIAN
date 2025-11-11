import { NextRequest } from "next/server";
import { event, heartBeat, requireEnv } from "@/lib/sse";

type OpenRouterChunk = {
  choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
};

export async function* streamFromOpenRouter(model: string, prompt: string, req: NextRequest) {
  yield heartBeat();
  const start = Date.now();

  const key = requireEnv("OPENROUTER_API_KEY", req);
  if (!key.ok) {
    yield event({ error: key.error }, "message");
    yield event({ done: true, tookMs: Date.now() - start }, "done");
    return;
  }

  const body = {
    model,
    stream: true,
    messages: [{ role: "user", content: prompt }],
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key.value}`,
      "X-Title": "Viber AI",
      "HTTP-Referer": req.nextUrl.origin,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    yield event({ error: `OpenRouter ${res.status}: ${errText || "request failed"}` }, "message");
    yield event({ done: true, tookMs: Date.now() - start }, "done");
    return;
  }

  if (!res.body) {
    const text = await res.text().catch(() => "");
    yield event({ error: `OpenRouter request failed: ${text || res.status}` }, "message");
    yield event({ done: true, tookMs: Date.now() - start }, "done");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split(/\r?\n/);
    // keep last partial line in buffer
    buf = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.replace(/^data:\s*/, "");
      if (payload === "[DONE]") continue;
      try {
        const json: OpenRouterChunk = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || "";
        if (delta) {
          yield event({ text: delta }, "message");
        }
      } catch {
        
      }
    }
  }

  yield event({ done: true, tookMs: Date.now() - start }, "done");
}