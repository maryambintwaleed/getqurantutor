"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALL_GRADES } from "@/lib/services";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin");
  return user;
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
  revalidatePath("/pro", "layout"); // credit adjustments show in the teacher sidebar
  revalidatePath("/");
}

export async function adjustCredits(formData: FormData) {
  await requireAdmin();
  const tutorId = String(formData.get("tutorId") ?? "");
  const amount = Number(formData.get("amount"));
  if (!tutorId || !Number.isFinite(amount) || amount === 0) return;

  await db.$transaction([
    db.tutorProfile.update({
      where: { id: tutorId },
      data: { balance: { increment: amount } },
    }),
    db.walletTransaction.create({
      data: {
        tutorId,
        amount,
        type: "TOPUP",
        note: `Adjustment by admin`,
      },
    }),
  ]);
  revalidateAdmin();
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "ADMIN") return; // never delete admins
  await db.user.delete({ where: { id: userId } });
  revalidateAdmin();
}

export type CategoryState = { error?: string };

export async function saveCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "📚";
  const description = String(formData.get("description") ?? "").trim();
  const grades = formData.getAll("grades").map(String).filter((g) => ALL_GRADES.includes(g));

  if (!name) return { error: "Name is required." };

  const data = {
    name,
    emoji,
    description,
    grades: JSON.stringify(grades),
  };

  if (id) {
    await db.service.update({ where: { id }, data });
  } else {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const clash = await db.service.findUnique({ where: { slug } });
    if (clash) return { error: "A category with a similar name already exists." };
    await db.service.create({ data: { ...data, slug } });
  }
  revalidateAdmin();
  redirect("/admin/categories");
}

export async function toggleCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const service = await db.service.findUnique({ where: { id } });
  if (!service) return;
  await db.service.update({ where: { id }, data: { active: !service.active } });
  revalidateAdmin();
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const requestCount = await db.request.count({ where: { serviceId: id } });
  if (requestCount > 0) {
    // Keep history intact — deactivate instead of deleting
    await db.service.update({ where: { id }, data: { active: false } });
  } else {
    await db.service.delete({ where: { id } });
  }
  revalidateAdmin();
}

export async function closeRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.request.update({ where: { id }, data: { status: "CLOSED" } });
  revalidateAdmin();
}

export async function deleteRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.request.delete({ where: { id } });
  revalidateAdmin();
}
