import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateAIResponse } from "@/lib/support-ai";

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

    // Save user message
    const userMessage = await db.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "USER",
        senderName: currentUser?.name ?? userName ?? "Guest",
        content: content.trim(),
      },
    });

    // Generate AI Assistant Response
    const aiResult = generateAIResponse(content.trim());
    
    // Save AI response message
    const aiMessage = await db.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "AI",
        senderName: "GetQuranTutor AI Assistant",
        content: aiResult.reply,
      },
    });

    // Update conversation updatedAt
    await db.supportConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const updatedMessages = await db.supportMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      messages: updatedMessages,
      suggestedAction: aiResult.suggestedAction,
    });
  } catch (error) {
    console.error("Support message API error:", error);
    return NextResponse.json(
      { error: "Failed to process support message" },
      { status: 500 }
    );
  }
}
