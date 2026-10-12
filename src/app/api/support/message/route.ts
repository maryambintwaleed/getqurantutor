import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const AUTO_REPLY_MESSAGE = `Assalamu Alaikum! 🌙

Thank you for reaching out to GetQuranTutor. We have received your message!

🕒 Live Support Hours (IST):

 • Monday – Friday: 7:30 PM – 10:30 PM IST
 • Saturday – Sunday: 5:30 PM – 9:30 PM IST

If you are contacting us outside of our live support hours, we normally reply within 24 hours.

Jazakum Allahu Khairan for your patience!`;

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

    // 1. Save user's message
    await db.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "USER",
        senderName: currentUser?.name ?? userName ?? "Guest",
        content: content.trim(),
      },
    });

    // 2. Save automated support hours response every time a message is sent
    await db.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "ADMIN",
        senderName: "Support Team",
        content: AUTO_REPLY_MESSAGE,
      },
    });

    // 3. Keep conversation marked OPEN with fresh timestamp
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
