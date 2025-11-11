import { NextRequest } from "next/server";
import { event, heartBeat, sseFromGenerator, sseHeaders } from "@/lib/sse";
import { streamFromProvider } from "@/lib/providers";
import { getStagePrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "unknown";
  const worker = searchParams.get("worker") || "worker1";
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
        const enhancedPrompt = getStagePrompt("reasoning", worker as any, prompt);
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

      for (const line of contentMap[worker] ?? []) {
        await new Promise((r) => setTimeout(r, 420));
        yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
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
      yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
    }
    yield event({ done: true, tookMs: Date.now() - start }, "done");
  }

  const responseStream = await sseFromGenerator(stream());
  return new Response(responseStream, { headers: sseHeaders() });
}