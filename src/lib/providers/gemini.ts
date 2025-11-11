import { NextRequest } from "next/server";
import { getApiKey, type StreamChunk } from "./base";

export async function* streamFromGemini(model: string, prompt: string, req: NextRequest): AsyncGenerator<StreamChunk, void, unknown> {
  const keyResult = getApiKey("gemini", req);
  if (!keyResult.ok) {
    yield { error: keyResult.error };
    return;
  }

  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    }
  };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${keyResult.value}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      yield { error: `Gemini request failed: ${res.status} ${errorText}` };
      return;
    }

    if (!res.body) {
      yield { error: "No response body from Gemini" };
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
          const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            yield { text: content };
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  } catch (error) {
    yield { error: `Gemini streaming error: ${error}` };
  }
}

