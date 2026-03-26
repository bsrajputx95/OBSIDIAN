import { NextRequest } from "next/server";
import { getApiKey, parseOpenAICompatibleStream, type StreamChunk } from "./base";

export async function* streamFromGroq(model: string, prompt: string, req: NextRequest): AsyncGenerator<StreamChunk, void, unknown> {
  const keyResult = getApiKey("groq", req);
  if (!keyResult.ok) {
    yield { error: keyResult.error };
    return;
  }

  const body = {
    model,
    stream: true,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  };

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyResult.value}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        if (attempt < MAX_RETRIES) {
          const waitMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          yield { text: `\n⏳ Rate limited by Groq (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${waitMs / 1000}s...\n` };
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        const errorText = await res.text().catch(() => "");
        yield { error: `Groq rate limit exceeded after ${MAX_RETRIES} retries: ${errorText}` };
        return;
      }

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        yield { error: `Groq request failed: ${res.status} ${errorText}` };
        return;
      }

      if (!res.body) {
        yield { error: "No response body from Groq" };
        return;
      }

      yield* parseOpenAICompatibleStream(res, "Groq");
      return; // Success, exit the retry loop
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        const waitMs = Math.pow(2, attempt) * 1000;
        yield { text: `\n⚠️ Connection error (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${waitMs / 1000}s...\n` };
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      yield { error: `Groq streaming error after retries: ${error}` };
    }
  }
}