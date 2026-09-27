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
    const { conversationId, status } = body;

    if (!conversationId || !["OPEN", "RESOLVED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status or missing parameters" }, { status: 400 });
    }

    const updated = await db.supportConversation.update({
      where: { id: conversationId },
      data: { status },
    });

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error("Admin support status update error:", error);
    return NextResponse.json({ error: "Failed to update support status" }, { status: 500 });
  }
}
