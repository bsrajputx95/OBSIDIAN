import { NextRequest } from "next/server";
import { requireEnv } from "@/lib/sse";

export type ProviderId =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "gemini"
  | "xai"
  | "mistral"
  | "groq"
  | "cohere"
  | "together";

export interface StreamChunk {
  text?: string;
  error?: string;
  done?: boolean;
  tookMs?: number;
}

export async function* parseOpenAICompatibleStream(res: Response, providerName: string): AsyncGenerator<StreamChunk, void, unknown> {
  if (!res.body) {
    yield { error: `${providerName} response body is null` };
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
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
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield { text: content };
          }
        } catch {
        }
      }
    }
  } catch (error) {
    yield { error: `${providerName} streaming error: ${error}` };
  }
}

export function getApiKey(provider: ProviderId, req: NextRequest): { ok: boolean; value?: string; error?: string } {
  const envKey = getEnvKey(provider);
  const result = requireEnv(envKey, req);
  return result;
}

function getEnvKey(provider: ProviderId): string {
  const keyMap: Record<ProviderId, string> = {
    openrouter: "OPENROUTER_API_KEY",
    openai: "OPENAI_API_KEY", 
    anthropic: "ANTHROPIC_API_KEY",
    gemini: "GOOGLE_API_KEY",
    xai: "XAI_API_KEY",
    mistral: "MISTRAL_API_KEY",
    groq: "GROQ_API_KEY",
    cohere: "COHERE_API_KEY",
    together: "TOGETHER_API_KEY"
  };
  return keyMap[provider];
}

