import { NextRequest } from "next/server";
import { event, heartBeat, requireEnv } from "@/lib/sse";

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

export interface StreamingProvider {
  stream(model: string, prompt: string, req: NextRequest): AsyncGenerator<any, void, unknown>;
}

export interface StreamChunk {
  text?: string;
  error?: string;
  done?: boolean;
  tookMs?: number;
}

export function createStreamingResponse(generator: AsyncGenerator<StreamChunk, void, unknown>) {
  return async function* stream() {
    yield heartBeat();
    const start = Date.now();
    
    try {
      for await (const chunk of generator) {
        if (chunk.text) {
          yield event({ text: chunk.text }, "message");
        }
        if (chunk.error) {
          yield event({ error: chunk.error }, "message");
        }
        if (chunk.done) {
          yield event({ done: true, tookMs: Date.now() - start }, "done");
          return;
        }
      }
    } catch (error) {
      yield event({ error: `Streaming error: ${error}` }, "message");
      yield event({ done: true, tookMs: Date.now() - start }, "done");
    }
  };
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

