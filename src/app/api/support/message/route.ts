import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, content, userName, userEmail } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    let conversation;

    if (conversationId) {
      conversation = await db.supportConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!conversation) {
      conversation = await db.supportConversation.create({
        data: {
          userId: currentUser?.id ?? null,
          userName: currentUser?.name ?? userName ?? "Guest",
          userEmail: currentUser?.email ?? userEmail ?? "",
          userRole: currentUser?.role ?? "GUEST",
          status: "OPEN",
        },
        include: { messages: true },
      });
    }

    // Save user message directly without automated bot responses
    await db.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "USER",
        senderName: currentUser?.name ?? userName ?? "Guest",
        content: content.trim(),
      },
    });

    // Update conversation status and timestamp
    await db.supportConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date(), status: "OPEN" },
    });

    const updatedMessages = await db.supportMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("Support message API error:", error);
    return NextResponse.json(
      { error: "Failed to process support message" },
      { status: 500 }
    );
  }
}
