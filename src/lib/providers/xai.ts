import { NextRequest } from "next/server";
import { getApiKey, parseOpenAICompatibleStream, type StreamChunk } from "./base";

export async function* streamFromXAI(model: string, prompt: string, req: NextRequest): AsyncGenerator<StreamChunk, void, unknown> {
  const keyResult = getApiKey("xai", req);
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

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyResult.value}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      yield { error: `xAI request failed: ${res.status} ${errorText}` };
      return;
    }

    if (!res.body) {
      yield { error: "No response body from xAI" };
      return;
    }

    yield* parseOpenAICompatibleStream(res, "xAI");
  } catch (error) {
    yield { error: `xAI streaming error: ${error}` };
  }
}