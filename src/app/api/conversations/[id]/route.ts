import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: { stageOutputs: true, sharedLinks: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedConversation = {
      ...conversation,
      modelConfig: conversation.modelConfig ? JSON.parse(conversation.modelConfig as string) : {},
    };

    return NextResponse.json(parsedConversation);
  } catch (error) {
    console.error("GET /api/conversations/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const conversation = await db.conversation.findUnique({ where: { id } });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.conversation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
