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
        const enhancedPrompt = getStagePrompt("final", worker as any, prompt);
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
        worker1: ["Master outputs: research synthesis"],
        worker2: ["Master outputs: reasoning synthesis"],
        worker3: ["Master outputs: coding synthesis"],
      };
      for (const line of contentMap[worker] ?? []) {
        await new Promise((r) => setTimeout(r, 380));
        yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
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
      yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
    }
    yield event({ done: true, tookMs: Date.now() - start }, "done");
  }

  const responseStream = await sseFromGenerator(stream());
  return new Response(responseStream, { headers: sseHeaders() });
}