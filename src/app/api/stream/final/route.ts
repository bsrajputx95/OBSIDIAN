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
        const enhancedPrompt = getStagePrompt("final", safeWorker as Worker, safePrompt, { workerOutputs, previousStageContext });
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
        worker1: ["Master outputs: research synthesis"],
        worker2: ["Master outputs: reasoning synthesis"],
        worker3: ["Master outputs: coding synthesis"],
      };
      for (const line of contentMap[safeWorker] ?? []) {
        await new Promise((r) => setTimeout(r, 380));
        yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: line }, "message");
      }
      yield event({ done: true, tookMs: Date.now() - start }, "done");
      return;
    }

    const lines = [
      "Final Master: Consolidate all master outputs (research, reasoning, coding).",
      "Guarantee: Preserve content fidelity, reorganize, and polish without deletion.",
      "Delivery: Export options (Markdown, JSON, PDF) and share links (stub).",
    ];
    for (const line of lines) {
      await new Promise((r) => setTimeout(r, 330));
      yield event({ sessionId: safeSessionId, worker: safeWorker, ts: Date.now(), text: line }, "message");
    }
    yield event({ done: true, tookMs: Date.now() - start }, "done");
  }

  const responseStream = await sseFromGenerator(stream());
  return new Response(responseStream, { headers: sseHeaders() });
}