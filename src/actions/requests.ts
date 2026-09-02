"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rememberPendingRequest } from "@/lib/pending";
import { notifyMatchingTeachers, notifyTeacherOfWin } from "@/lib/notify";
import { isKnownCountry } from "@/lib/geo";
import { GRADE_QUESTION_TEXT, TUTOR_GENDER_QUESTION } from "@/lib/services";

export async function createRequest(input: {
  slug: string;
  answers: { question: string; answer: string }[];
  details: string;
  parentName: string;
  email: string;
  city: string;
  urgent: boolean;
}) {
  const serviceRec = await db.service.findUnique({ where: { slug: input.slug } });
  if (!serviceRec || !serviceRec.active) throw new Error("Service not found");

  const user = await getCurrentUser();

  // Quran classes are delivered online worldwide.
  const mode = "Online";
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
      parentId: user?.id ?? null,
      parentName: input.parentName || user?.name || "A parent",
      serviceId: serviceRec.id,
      answers: JSON.stringify(input.answers),
      grade: input.answers.find((a) => a.question === GRADE_QUESTION_TEXT)?.answer ?? "",
      tutorGender,
      email: input.email.trim().toLowerCase(),
      details: input.details,
      mode,
      // Picked from a list in the form; anything else is discarded rather than
      // stored, so locations stay comparable.
      city: isKnownCountry(input.city) ? input.city : "",
      urgent,
    },
  });

  if (!user) await rememberPendingRequest(created.id);

  // Sent after the response, so a slow mail provider never delays the family.
  after(() => notifyMatchingTeachers(created.id));

  redirect(user ? "/requests" : "/request-received");
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
