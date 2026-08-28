import { cookies } from "next/headers";
import { db } from "./db";

const PENDING_COOKIE = "gqt_pending_requests";
const PENDING_DAYS = 30;

/**
 * Families can post a request without an account — the confirmation page then
 * invites them to sign up to read their quotes. Remember what they posted so
 * the request can be attached to the account they create next, otherwise it is
 * orphaned and they can never reach their own quotes.
 */
export async function rememberPendingRequest(requestId: string) {
  const cookieStore = await cookies();
  const existing = readIds(cookieStore.get(PENDING_COOKIE)?.value);
  const ids = [...new Set([...existing, requestId])].slice(-10);
  cookieStore.set(PENDING_COOKIE, JSON.stringify(ids), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_DAYS * 24 * 60 * 60,
  });
}

/** Attaches any requests posted from this browser to the account just used. */
export async function claimPendingRequests(userId: string) {
  const cookieStore = await cookies();
  const ids = readIds(cookieStore.get(PENDING_COOKIE)?.value);
  if (ids.length === 0) return 0;

  // Only unclaimed requests — never reassign one that already has an owner.
  const { count } = await db.request.updateMany({
    where: { id: { in: ids }, parentId: null },
    data: { parentId: userId },
  });
  cookieStore.delete(PENDING_COOKIE);
  return count;
}

function readIds(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
