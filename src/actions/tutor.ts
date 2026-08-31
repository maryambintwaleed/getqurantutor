"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALL_GRADES, ALL_LANGUAGES, QUOTE_FEE } from "@/lib/services";
import { isKnownCountry, isKnownZone } from "@/lib/geo";
import { notifyFamilyOfQuote } from "@/lib/notify";

async function requireTutor() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TUTOR" || !user.tutorProfile) redirect("/login");
  return user.tutorProfile;
}

export type QuoteState = { error?: string };

export async function sendQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const profile = await requireTutor();
  const requestId = String(formData.get("requestId") ?? "");
  const price = Number(formData.get("price"));
  const message = String(formData.get("message") ?? "").trim();
  const sharePhone = formData.get("sharePhone") === "on";

  if (!requestId || !Number.isFinite(price) || price <= 0 || !message) {
    return { error: "Please enter a price and a message." };
  }

  if (profile.status !== "APPROVED") {
    return { error: "Your account is still being verified — you cannot send quotes yet." };
  }

  const request = await db.request.findUnique({ where: { id: requestId }, include: { service: true } });
  if (!request || request.status !== "OPEN") {
    return { error: "This opportunity is no longer open." };
  }
  const existing = await db.quote.findUnique({
    where: { requestId_tutorId: { requestId, tutorId: profile.id } },
  });
  if (existing) {
    return { error: "You already sent a quote for this opportunity." };
  }

  const fresh = await db.tutorProfile.findUniqueOrThrow({ where: { id: profile.id } });
  if (fresh.balance < QUOTE_FEE) {
    return { error: `You need ${QUOTE_FEE} credits to send a quote. Top up your wallet.` };
  }

  const [quote] = await db.$transaction([
    db.quote.create({
      data: { requestId, tutorId: profile.id, price, message, sharePhone },
    }),
    db.tutorProfile.update({
      where: { id: profile.id },
      data: { balance: { decrement: QUOTE_FEE } },
    }),
    db.walletTransaction.create({
      data: {
        tutorId: profile.id,
        amount: -QUOTE_FEE,
        type: "QUOTE_FEE",
        note: `Quote: ${request.service.name} — ${request.parentName}`,
      },
    }),
  ]);

  // The balance lives in the dashboard layout, so revalidate the layout too —
  // otherwise every screen keeps showing the pre-quote balance.
  revalidatePath("/pro", "layout");
  after(() => notifyFamilyOfQuote(quote.id));
  redirect("/pro/quotes");
}

export async function toggleService(serviceId: string, enabled: boolean) {
  const profile = await requireTutor();
  if (enabled) {
    await db.tutorService.upsert({
      where: { tutorId_serviceId: { tutorId: profile.id, serviceId } },
      update: {},
      create: { tutorId: profile.id, serviceId },
    });
  } else {
    await db.tutorService.deleteMany({ where: { tutorId: profile.id, serviceId } });
  }
  revalidatePath("/pro/services");
  revalidatePath("/pro/opportunities");
  redirect("/pro/services?saved=1");
}

export async function updateTutorGrades(formData: FormData) {
  const profile = await requireTutor();
  const grades = formData.getAll("grades").map(String).filter((g) => ALL_GRADES.includes(g));
  await db.tutorProfile.update({
    where: { id: profile.id },
    data: { grades: JSON.stringify(grades) },
  });
  revalidatePath("/pro/services");
  revalidatePath("/pro/opportunities");
}

// Only values from the published lists are stored, so a country or zone can
// never come back as stray free text.
function pickKnown(value: FormDataEntryValue | null, allowed: (v: string) => boolean) {
  const text = String(value ?? "").trim();
  return allowed(text) ? text : "";
}

export async function updateTutorProfile(formData: FormData) {
  const profile = await requireTutor();
  const gender = formData.get("gender") === "Female" ? "Female" : "Male";
  const languages = formData
    .getAll("languages")
    .map(String)
    .filter((l) => ALL_LANGUAGES.includes(l));

  await db.tutorProfile.update({
    where: { id: profile.id },
    data: {
      gender,
      languages: JSON.stringify(languages),
      bio: String(formData.get("bio") ?? "").trim().slice(0, 600),
      country: pickKnown(formData.get("country"), isKnownCountry),
      timezone: pickKnown(formData.get("timezone"), isKnownZone),
      ijazah: formData.get("ijazah") === "on",
      hafiz: formData.get("hafiz") === "on",
    },
  });
  revalidatePath("/pro/profile");
  revalidatePath("/pro/opportunities");
  redirect("/pro/profile?saved=1");
}

export async function topUp(formData: FormData) {
  const profile = await requireTutor();
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) return;

  await db.$transaction([
    db.tutorProfile.update({
      where: { id: profile.id },
      data: { balance: { increment: amount } },
    }),
    db.walletTransaction.create({
      data: { tutorId: profile.id, amount, type: "TOPUP", note: "Wallet top-up" },
    }),
  ]);
  revalidatePath("/pro/wallet");
  revalidatePath("/pro", "layout");
}
