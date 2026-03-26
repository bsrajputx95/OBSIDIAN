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
        const enhancedPrompt = getStagePrompt("research", safeWorker as Worker, safePrompt, { workerOutputs, previousStageContext });
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
          "Market analysis: Identify competitors in multi-model orchestration (OpenRouter, LangChain, LlamaIndex).",
          "Top solutions: OpenRouter catalog for model discovery and routing; custom orchestration needed for 16-slot stage flow.",
          "Competitive gap: Few products stream 4 concurrent models per stage with a master aggregator UI.",
        ],
        worker2: [
          "Tech stack: Next.js App Router (14+), Tailwind v4, shadcn/ui, Zustand, SSE.",
          "Best practices: ReadableStream for SSE, backpressure-aware streaming, Promise.all for concurrency.",
          "Patterns: Provider-agnostic clients, capability detection, robust error handling and retries.",
        ],
        worker3: [
          "Problem validation: Users want research→reasoning→coding pipeline from a single prompt.",
          "Edge cases: Rate limits, partial failures, model capability mismatch, long context.",
          "Failure modes: API key missing, SSE disconnects, master model starting before workers finish.",
        ],
      };

      for (const line of contentMap[safeWorker] ?? []) {
        await new Promise((r) => setTimeout(r, 400));
        yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: line }, "message");
      }
      yield event({ done: true, tookMs: Date.now() - start }, "done");
      return;
    }

    const lines = [
      "Master synthesis: Combine market, stack, and validation without removing details.",
      "Action plan: Prioritize concurrent streaming architecture, model selectors, and robust error states.",
      "Outcome: Ready to proceed to Reasoning with concrete architecture and tasks.",
    ];
    for (const line of lines) {
      await new Promise((r) => setTimeout(r, 350));
      yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: line }, "message");
    }
    yield event({ done: true, tookMs: Date.now() - start }, "done");
  }

  const responseStream = await sseFromGenerator(stream());
  return new Response(responseStream, { headers: sseHeaders() });
}