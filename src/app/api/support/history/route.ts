import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ messages: [] });
    }

    const conversation = await db.supportConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] }, { status: 404 });
    }

    return NextResponse.json({
      conversationId: conversation.id,
      status: conversation.status,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Support history API error:", error);
    return NextResponse.json({ error: "Failed to fetch support history" }, { status: 500 });
  }
}
