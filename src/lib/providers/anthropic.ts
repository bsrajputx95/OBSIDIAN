import { NextRequest } from "next/server";
import { getApiKey, type StreamChunk } from "./base";

export async function* streamFromAnthropic(model: string, prompt: string, req: NextRequest): AsyncGenerator<StreamChunk, void, unknown> {
  const keyResult = getApiKey("anthropic", req);
  if (!keyResult.ok) {
    yield { error: keyResult.error };
    return;
  }

  const body = {
    model,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": keyResult.value!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      yield { error: `Anthropic request failed: ${res.status} ${errorText}` };
      return;
    }

    if (!res.body) {
      yield { error: "No response body from Anthropic" };
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
          const content = json.delta?.text;
          if (content) {
            yield { text: content };
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  } catch (error) {
    yield { error: `Anthropic streaming error: ${error}` };
  }
}

