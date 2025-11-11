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
        const enhancedPrompt = getStagePrompt("coding", worker as any, prompt);
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
          "File structure: src/app/api/stream/*, src/components/*, src/lib/providers/*, src/lib/store/*.",
          "DB schema: conversations, stages, messages, configs (Supabase).",
          "API design: /api/stream/{stage}?worker={1|2|3|master}&sessionId=...",
        ],
        worker2: [
          "Components: StagePanel, StreamingPane, ModelSelector, StageControls.",
          "State: Zustand stores for models and stage control.",
          "UX: Tabs for stages, 4-panel layout with shadcn/ui.",
        ],
        worker3: [
          "Security: Validate env vars, sanitize user prompt, rate limit endpoints.",
          "Testing: Unit tests for SSE generator and streaming reducers.",
          "Deployment: Vercel with edge-eligible routes where appropriate.",
        ],
      };

      for (const line of contentMap[worker] ?? []) {
        await new Promise((r) => setTimeout(r, 400));
        yield event({ sessionId, worker, ts: Date.now(), text: line }, "message");
      }
      yield event({ done: true, tookMs: Date.now() - start }, "done");
      return;
    }

    const lines = [
      "Master synthesis: Confirm file layout, endpoint contract, and component responsibilities.",
      "Implementation guide: Build minimal working pipeline; integrate providers behind feature flags.",
      "Next: Final stage consolidates masters; add export/share functionality.",
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