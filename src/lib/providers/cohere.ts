import { NextRequest } from "next/server";
import { getApiKey, type StreamChunk } from "./base";

export async function* streamFromCohere(model: string, prompt: string, req: NextRequest): AsyncGenerator<StreamChunk, void, unknown> {
  const keyResult = getApiKey("cohere", req);
  if (!keyResult.ok) {
    yield { error: keyResult.error };
    return;
  }

  const body = {
    model,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  };

  try {
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyResult.value}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      yield { error: `Cohere request failed: ${res.status} ${errorText}` };
      return;
    }

    if (!res.body) {
      yield { error: "No response body from Cohere" };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          yield { done: true };
          return;
        }

        try {
          const json = JSON.parse(payload);
          if (json.type === "content-delta") {
            const text = json.delta?.message?.content?.text;
            if (text) {
              yield { text };
            }
          } else if (json.type === "message-end") {
            yield { done: true };
            return;
          }
        } catch {
        }
      }
    }
  } catch (error) {
    yield { error: `Cohere streaming error: ${error}` };
  }
}