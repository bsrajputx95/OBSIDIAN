import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const conversations = await db.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, prompt: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const body = await request.json();
    const { id, title, prompt, modelConfig, stageOutputs } = body;

    const stageOutputCreate = [];
    if (stageOutputs) {
      for (const [stage, workers] of Object.entries(stageOutputs as Record<string, Record<string, { content: string; model: string; elapsedMs?: number }>>)) {
        for (const [worker, data] of Object.entries(workers)) {
          stageOutputCreate.push({
            stage: stage as "research" | "reasoning" | "coding" | "final",
            worker: worker as "worker1" | "worker2" | "worker3" | "master",
            content: data.content,
            model: data.model,
            elapsedMs: data.elapsedMs ?? null,
          });
        }
      }
    }

    if (id) {
      await db.stageOutput.deleteMany({ where: { conversationId: id } });

      const conversation = await db.conversation.upsert({
        where: { id },
        create: {
          userId: session.user.id,
          title: title || "Untitled",
          prompt: prompt || "",
          modelConfig: JSON.stringify(modelConfig || {}),
          stageOutputs: {
            create: stageOutputCreate,
          },
        },
        update: {
          title: title || "Untitled",
          prompt: prompt || "",
          modelConfig: JSON.stringify(modelConfig || {}),
        },
      });

      if (stageOutputCreate.length > 0) {
        await db.stageOutput.createMany({
          data: stageOutputCreate.map((so) => ({ ...so, conversationId: conversation.id })),
        });
      }

      return NextResponse.json(conversation, { status: 201 });
    }

    const conversation = await db.conversation.create({
      data: {
        userId: session.user.id,
        title: title || "Untitled",
        prompt: prompt || "",
        modelConfig: JSON.stringify(modelConfig || {}),
        stageOutputs: {
          create: stageOutputCreate,
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
