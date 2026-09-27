"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { claimPendingRequests } from "@/lib/pending";
import { notifyTeacherToSubmitVoiceRecording } from "@/lib/notify";

export type AuthState = { error?: string };

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "TUTOR" ? "TUTOR" : "PARENT";
  const gender = formData.get("gender") === "Female" ? "Female" : "Male";

  if (!name || !email || password.length < 6) {
    return { error: "Please fill all fields (password at least 6 characters)." };
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in." };
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashPassword(password),
      role,
      ...(role === "TUTOR"
        ? { tutorProfile: { create: { balance: 20, gender } } } // 20 free starter credits
        : {}),
    },
    include: { tutorProfile: true },
  });
  await createSession(user.id);
  if (role === "PARENT") {
    const claimed = await claimPendingRequests(user.id);
    if (claimed > 0) redirect("/requests"); // straight to the quotes they signed up for
  }
  if (role === "TUTOR" && user.tutorProfile) {
    after(() => notifyTeacherToSubmitVoiceRecording(user.tutorProfile!.id));
  }
  redirect(role === "TUTOR" ? "/pro/profile" : "/");
}


export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.password)) {
    return { error: "Wrong email or password." };
  }
  await createSession(user.id);
  if (user.role === "PARENT") await claimPendingRequests(user.id);
  redirect(destinationFor(user.role, next));
}

/** Where each role belongs once signed in. */
function homeFor(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "TUTOR") return "/pro/opportunities";
  return "/requests";
}

/**
 * Honours ?next= only when it belongs to this user's side of the product.
 * Without this, a teacher who opened the family page while logged out is sent
 * straight back to it after signing in — landing on a page that invites them
 * to hire a teacher. Also refuses anything that is not a local path, so the
 * parameter cannot bounce someone to another site.
 */
function destinationFor(role: string, next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) return homeFor(role);

  const area =
    next.startsWith("/admin") ? "ADMIN" : next.startsWith("/pro") ? "TUTOR" : "PARENT";
  return area === role ? next : homeFor(role);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
