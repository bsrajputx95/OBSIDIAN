import { NextRequest } from "next/server";
import { event, heartBeat, sseFromGenerator, sseHeaders } from "@/lib/sse";
import { streamFromProvider } from "@/lib/providers";
import { getStagePrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "unknown";
  const worker = searchParams.get("worker") || "worker1"; // worker1|worker2|worker3|master
  const provider = searchParams.get("provider") || null;
  const model = searchParams.get("model") || "";
  const prompt = searchParams.get("prompt") || "";

  async function* stream() {
    yield heartBeat();
    const start = Date.now();

    // If a provider and model are provided, stream live data
    if (provider && model && prompt) {
      try {
        // Enhance prompt with stage-specific instructions
        const enhancedPrompt = getStagePrompt("research", worker as any, prompt);
        for await (const chunk of streamFromProvider(provider as any, model, enhancedPrompt, req)) {
          if (chunk.text) {
            yield event({ sessionId, worker, ts: Date.now(), text: chunk.text }, "message");
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
      return;
    }

    // Fallback to dummy content if no provider/model
    if (worker !== "master") {
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

      for (const line of contentMap[worker] ?? []) {
        await new Promise((r) => setTimeout(r, 400));
        yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
      }
      yield event({ done: true, tookMs: Date.now() - start }, "done");
      return;
    }

    // Master waits for workers (UI ensures sequencing). Provide synthesis guidance.
    const lines = [
      "Master synthesis: Combine market, stack, and validation without removing details.",
      "Action plan: Prioritize concurrent streaming architecture, model selectors, and robust error states.",
      "Outcome: Ready to proceed to Reasoning with concrete architecture and tasks.",
    ];
    for (const line of lines) {
      await new Promise((r) => setTimeout(r, 350));
      yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
    }
    yield event({ done: true, tookMs: Date.now() - start }, "done");
  }

  const responseStream = await sseFromGenerator(stream());
  return new Response(responseStream, { headers: sseHeaders() });
}