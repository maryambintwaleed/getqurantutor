"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyMatchingTeachers, notifyTeacherOfWin } from "@/lib/notify";
import { isKnownCountry } from "@/lib/geo";
import { GRADE_QUESTION_TEXT, TUTOR_GENDER_QUESTION, SCHOOL_HIRING_SLUG, getService } from "@/lib/services";

export async function createRequest(input: {
  slug: string;
  answers: { question: string; answer: string }[];
  details: string;
  parentName: string;
  email: string;
  city: string;
  mode?: string;
  isSchool?: boolean;
  urgent: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/register?next=${encodeURIComponent(`/request/${input.slug}`)}`);
  }

  let serviceRec = await db.service.findUnique({ where: { slug: input.slug } });
  if (!serviceRec && input.slug === SCHOOL_HIRING_SLUG) {
    const def = getService(SCHOOL_HIRING_SLUG)!;
    serviceRec = await db.service.create({
      data: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        emoji: def.emoji,
        priceMin: def.priceMin,
        priceMax: def.priceMax,
        grades: JSON.stringify(def.grades),
      },
    });
  }
  if (!serviceRec || !serviceRec.active) throw new Error("Service not found");

  const mode = input.mode === "Offline" ? "Offline" : "Online";
  const isSchool = Boolean(
    input.isSchool ||
      input.slug === SCHOOL_HIRING_SLUG ||
      input.answers.some((a) => a.answer.toLowerCase().includes("school"))
  );
  const genderAnswer =
    input.answers.find((a) => a.question === TUTOR_GENDER_QUESTION)?.answer ?? "";
  const tutorGender = genderAnswer.startsWith("Female")
    ? "Female"
    : genderAnswer.startsWith("Male")
      ? "Male"
      : "";
  const urgent =
    input.urgent ||
    input.answers.some((a) => a.answer === "As soon as possible");

  const created = await db.request.create({
    data: {
      parentId: user.id,
      parentName: input.parentName || user.name || (isSchool ? "A school" : "A family"),
      serviceId: serviceRec.id,
      answers: JSON.stringify(input.answers),
      grade: input.answers.find((a) => a.question === GRADE_QUESTION_TEXT)?.answer ?? "",
      tutorGender,
      email: (input.email || user.email).trim().toLowerCase(),
      details: input.details,
      mode,
      // Picked from a list in the form; anything else is discarded rather than
      // stored, so locations stay comparable.
      city: isKnownCountry(input.city) ? input.city : "",
      urgent,
      isSchool,
    },
  });

  // Sent after the response, so a slow mail provider never delays the family.
  after(() => notifyMatchingTeachers(created.id));

  const query = tutorGender ? `?gender=${encodeURIComponent(tutorGender)}` : "";
  redirect(`/request-received${query}`);
}

export async function acceptQuote(quoteId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const quote = await db.quote.findUnique({ where: { id: quoteId }, include: { request: true } });
  if (!quote || quote.request.parentId !== user.id) throw new Error("Not allowed");

  await db.$transaction([
    db.quote.update({ where: { id: quoteId }, data: { status: "WON" } }),
    db.quote.updateMany({
      where: { requestId: quote.requestId, id: { not: quoteId } },
      data: { status: "DECLINED" },
    }),
    db.request.update({ where: { id: quote.requestId }, data: { status: "CLOSED" } }),
  ]);
  revalidatePath("/requests");
  revalidatePath("/pro", "layout");
  after(() => notifyTeacherOfWin(quoteId));
}

export async function updateRequestMode(requestId: string, nextMode: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const req = await db.request.findUnique({ where: { id: requestId } });
  if (!req || req.parentId !== user.id) throw new Error("Not allowed");

  const mode = nextMode === "Offline" ? "Offline" : "Online";
  await db.request.update({
    where: { id: requestId },
    data: { mode },
  });

  revalidatePath("/requests");
  revalidatePath("/pro/opportunities");
  revalidatePath(`/pro/opportunities/${requestId}`);
  revalidatePath("/pro/quotes");
}
