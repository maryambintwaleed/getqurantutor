import { db } from "./db";
import { sendEmail, siteUrl } from "./email";

/**
 * A lead is worthless if nobody knows it exists. Teachers who match the
 * request's course, student level and requested gender are told immediately —
 * the same three rules the Opportunities list uses, so nobody is emailed about
 * a lead they cannot see.
 */
export async function notifyMatchingTeachers(requestId: string) {
  const request = await db.request.findUnique({
    where: { id: requestId },
    include: { service: true },
  });
  if (!request || request.status !== "OPEN") return;

  const candidates = await db.tutorProfile.findMany({
    where: { services: { some: { serviceId: request.serviceId } } },
    include: { user: true },
  });

  const matches = candidates.filter((tutor) => {
    const levels: string[] = JSON.parse(tutor.grades || "[]");
    const levelOk = levels.length === 0 || !request.grade || levels.includes(request.grade);
    const genderOk = !request.tutorGender || tutor.gender === request.tutorGender;
    return levelOk && genderOk;
  });

  const where = [request.grade, request.city].filter(Boolean).join(" · ");
  await Promise.all(
    matches.map((tutor) =>
      sendEmail({
        to: tutor.user.email,
        subject: `New ${request.service.name} student${request.city ? ` in ${request.city}` : ""}`,
        heading: "A family is looking for a teacher",
        body: [
          `<b>${escape(request.service.name)}</b>${where ? ` — ${escape(where)}` : ""}`,
          request.details ? `“${escape(request.details.slice(0, 240))}”` : "",
          "Families usually choose from the first few replies, so it is worth answering today.",
        ].filter(Boolean),
        cta: { label: "See the request", href: `${siteUrl()}/pro/opportunities/${request.id}` },
      })
    )
  );
}

/** Tells the family a quote arrived, so they come back and compare. */
export async function notifyFamilyOfQuote(quoteId: string) {
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: {
      tutor: { include: { user: true } },
      request: { include: { service: true, parent: true } },
    },
  });
  if (!quote) return;

  const to = quote.request.parent?.email || quote.request.email;
  if (!to) return;

  const credentials = [
    quote.tutor.ijazah ? "holds an ijazah" : "",
    quote.tutor.hafiz ? (quote.tutor.gender === "Female" ? "hafiza" : "hafiz") : "",
    quote.tutor.country,
  ].filter(Boolean).join(" · ");

  await sendEmail({
    to,
    subject: `A teacher replied about your ${quote.request.service.name} request`,
    heading: `${escape(quote.tutor.user.name)} sent you a quote`,
    body: [
      `<b>$${quote.price} per class</b>${credentials ? ` — ${escape(credentials)}` : ""}`,
      `“${escape(quote.message.slice(0, 240))}”`,
      "Compare the replies you have received and pick the teacher that suits your family.",
    ],
    cta: { label: "View your quotes", href: `${siteUrl()}/requests` },
  });
}

/** Tells a teacher they won the student. */
export async function notifyTeacherOfWin(quoteId: string) {
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { tutor: { include: { user: true } }, request: { include: { service: true } } },
  });
  if (!quote) return;

  await sendEmail({
    to: quote.tutor.user.email,
    subject: `${quote.request.parentName} chose you`,
    heading: "You won this student",
    body: [
      `<b>${escape(quote.request.service.name)}</b> — ${escape(quote.request.parentName)} accepted your quote of $${quote.price} per class.`,
      "Get in touch to arrange the first class while they are still keen.",
    ],
    cta: { label: "See the details", href: `${siteUrl()}/pro/wins` },
  });
}

function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
