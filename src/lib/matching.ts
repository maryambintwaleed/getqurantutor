/**
 * Prisma where-fragment: a tutor sees a request if they teach its level,
 * the request has no level, or the tutor hasn't restricted their levels.
 */
export function gradeWhere(tutorGradesJson: string) {
  const grades: string[] = JSON.parse(tutorGradesJson || "[]");
  if (grades.length === 0) return {};
  return { OR: [{ grade: "" }, { grade: { in: grades } }] };
}

/**
 * Families frequently require a female (or male) teacher — especially for
 * daughters and for sisters studying themselves. A tutor never sees a request
 * that asked for the other gender.
 */
export function genderWhere(tutorGender: string) {
  if (!tutorGender) return { tutorGender: "" }; // gender not set: only no-preference leads
  return { OR: [{ tutorGender: "" }, { tutorGender }] };
}
