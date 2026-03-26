import { NextRequest } from "next/server";
import { streamFromOpenRouter } from "./openrouter";
import { streamFromOpenAI } from "./openai";
import { streamFromAnthropic } from "./anthropic";
import { streamFromGemini } from "./gemini";
import { streamFromXAI } from "./xai";
import { streamFromMistral } from "./mistral";
import { streamFromGroq } from "./groq";
import { streamFromCohere } from "./cohere";
import { streamFromTogether } from "./together";
import { type ProviderId, type StreamChunk } from "./base";

export async function* streamFromProvider(
  provider: ProviderId,
  model: string,
  prompt: string,
  req: NextRequest
): AsyncGenerator<StreamChunk, void, unknown> {
  switch (provider) {
    case "openrouter":
      yield* streamFromOpenRouter(model, prompt, req);
      break;
    case "openai":
      yield* streamFromOpenAI(model, prompt, req);
      break;
    case "anthropic":
      yield* streamFromAnthropic(model, prompt, req);
      break;
    case "gemini":
      yield* streamFromGemini(model, prompt, req);
      break;
    case "xai":
      yield* streamFromXAI(model, prompt, req);
      break;
    case "mistral":
      yield* streamFromMistral(model, prompt, req);
      break;
    case "groq":
      yield* streamFromGroq(model, prompt, req);
      break;
    case "cohere":
      yield* streamFromCohere(model, prompt, req);
      break;
    case "together":
      yield* streamFromTogether(model, prompt, req);
      break;
    default:
      yield { error: `Unsupported provider: ${provider}` };
  }
}