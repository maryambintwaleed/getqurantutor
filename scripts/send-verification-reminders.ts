import "dotenv/config";
import { db } from "../src/lib/db";
import { sendEmail, siteUrl } from "../src/lib/email";

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function main() {
  console.log("Looking for unverified teachers...");

  const unverified = await db.tutorProfile.findMany({
    where: {
      status: { in: ["PENDING", "REJECTED"] },
    },
    include: {
      user: true,
    },
  });

  console.log(`Found ${unverified.length} unverified teacher(s).`);

  if (unverified.length === 0) {
    console.log("No unverified teachers found.");
    process.exit(0);
  }

  let count = 0;
  for (const tutor of unverified) {
    if (!tutor.user?.email) continue;
    console.log(`Sending reminder to ${tutor.user.name} (${tutor.user.email})...`);

    const result = await sendEmail({
      to: tutor.user.email,
      subject: "Action Required: Please complete your teacher verification",
      heading: "Apply for verification to start receiving student requests",
      body: [
        `Assalamu Alaikum ${escapeHtml(tutor.user.name)},`,
        "You registered as a Quran teacher on GetQuranTutor, but your teaching profile has not been verified yet.",
        "Families looking for Quran, Tajweed, and Arabic classes are posting new requests every day. To ensure child safety and authenticity, only verified teachers can view student opportunities and send quotes.",
        "Applying for verification takes just 2 minutes — simply upload a short Quran recitation audio sample and your ID document to get approved.",
      ],
      cta: {
        label: "Complete Verification Now",
        href: `${siteUrl()}/pro/verification`,
      },
    });

    console.log(`Status for ${tutor.user.email}:`, result);
    count++;
  }

  console.log(`\nAll done! Sent verification reminder email to ${count} teacher(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error executing reminders script:", err);
  process.exit(1);
});
