import { NextRequest } from "next/server";
import { streamFromOpenRouter } from "./openrouter";
import { streamFromOpenAI } from "./openai";
import { streamFromAnthropic } from "./anthropic";
import { streamFromGemini } from "./gemini";
import { type ProviderId } from "./base";

export async function* streamFromProvider(
  provider: ProviderId,
  model: string,
  prompt: string,
  req: NextRequest
): AsyncGenerator<any, void, unknown> {
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
    default:
      yield { error: `Unsupported provider: ${provider}` };
  }
}

