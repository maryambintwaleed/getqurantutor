"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

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
  });
  await createSession(user.id);
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
  redirect(
    next ||
      (user.role === "ADMIN"
        ? "/admin"
        : user.role === "TUTOR"
          ? "/pro/opportunities"
          : "/requests")
  );
}

export async function logout() {
  await destroySession();
  redirect("/");
}
