import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { conversationId, content } = body;

    if (!conversationId || !content || !content.trim()) {
      return NextResponse.json({ error: "Conversation ID and content required" }, { status: 400 });
    }

    const message = await db.supportMessage.create({
      data: {
        conversationId,
        sender: "ADMIN",
        senderName: user.name ?? "Support Team",
        content: content.trim(),
      },
    });

    await db.supportConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Admin support reply error:", error);
    return NextResponse.json({ error: "Failed to send admin reply" }, { status: 500 });
  }
}
