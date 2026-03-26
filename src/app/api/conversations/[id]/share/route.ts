import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { db } from "@/lib/db";

export async function POST(
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

    const slug = crypto.randomUUID().slice(0, 8);

    const sharedLink = await db.sharedLink.create({
      data: {
        conversationId: id,
        slug,
        isPublic: true,
      },
    });

    return NextResponse.json({ url: `/share/${slug}`, slug: sharedLink.slug });
  } catch (error) {
    console.error("POST /api/conversations/[id]/share error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
