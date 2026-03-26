import { NextRequest } from "next/server";
import { event, heartBeat, sseFromGenerator, sseHeaders } from "@/lib/sse";
import { streamFromProvider } from "@/lib/providers";
import { getStagePrompt, type Worker } from "@/lib/prompts";
import { type ProviderId } from "@/lib/providers/base";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { prompt, worker, sessionId, model, provider, workerOutputs = [], previousStageContext = "" } = await req.json();
  const safeWorker = worker ?? "worker1";
  const safeSessionId = sessionId ?? "unknown";
  const safeModel = model ?? "";
  const safeProvider = provider ?? null;
  const safePrompt = prompt ?? "";

  async function* stream() {
    yield heartBeat();
    const start = Date.now();

    if (safeProvider && safeModel && safePrompt) {
      try {
        const enhancedPrompt = getStagePrompt("reasoning", safeWorker as Worker, safePrompt, { workerOutputs, previousStageContext });
        for await (const chunk of streamFromProvider(safeProvider as ProviderId, safeModel, enhancedPrompt, req)) {
          if (chunk.text) {
            yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: chunk.text }, "message");
          }
          if (chunk.error) {
            yield event({ error: chunk.error }, "message");
          }
          if (chunk.done) {
            yield event({ done: true, tookMs: Date.now() - start }, "done");
            return;
          }
        }
        yield event({ done: true, tookMs: Date.now() - start }, "done");
      } catch (error) {
        yield event({ error: `Streaming error: ${error}` }, "message");
        yield event({ done: true, tookMs: Date.now() - start }, "done");
      }
      return;
    }

    if (safeWorker !== "master") {
      const contentMap: Record<string, string[]> = {
        worker1: [
          "Decompose: UI → streaming engine → model orchestration → persistence → auth.",
          "Solution architecture: Client spawns 3 SSE workers, master runs after settled.",
          "Validation: Ensure model config persists via Zustand + Supabase later.",
        ],
        worker2: [
          "Risks: API rate limits, SSE disconnects, provider heterogeneity.",
          "Trade-offs: SSE simplicity vs. WebSockets; choose SSE for wide provider support.",
          "Optimization: Debounced UI updates, request batching, backpressure handling.",
        ],
        worker3: [
          "Methodology: Incremental delivery with verification gates per stage.",
          "Timeline: Scaffold → UI panels → SSE → provider clients → persistence.",
          "Resources: API keys, Supabase project, NextAuth/Clerk setup.",
        ],
      };

      for (const line of contentMap[safeWorker] ?? []) {
        await new Promise((r) => setTimeout(r, 420));
        yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: line }, "message");
      }
      yield event({ done: true, tookMs: Date.now() - start }, "done");
      return;
    }

    const lines = [
      "Master synthesis: Adopt SSE with error boundaries; persist configs; modular providers.",
      "Decisions: Keep provider-agnostic; add capability checks; use allSettled for workers.",
      "Next: Begin Coding stage with concrete file structure and endpoints.",
    ];
    for (const line of lines) {
      await new Promise((r) => setTimeout(r, 360));
      yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: line }, "message");
    }
    yield event({ done: true, tookMs: Date.now() - start }, "done");
  }

  const responseStream = await sseFromGenerator(stream());
  return new Response(responseStream, { headers: sseHeaders() });
}