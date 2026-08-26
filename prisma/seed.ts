import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SERVICES } from "../src/lib/services";
import { randomBytes, scryptSync } from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set — add it to .env");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

async function main() {
  // Courses
  const serviceIds: Record<string, string> = {};
  for (const s of SERVICES) {
    const data = {
      name: s.name,
      description: s.description,
      emoji: s.emoji,
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      grades: JSON.stringify(s.grades),
    };
    const rec = await db.service.upsert({
      where: { slug: s.slug },
      update: data,
      create: { slug: s.slug, ...data },
    });
    serviceIds[s.slug] = rec.id;
  }

  // Demo teachers
  const teachers = [
    {
      email: "teacher@demo.com",
      name: "Ustadha Maryam Siddiqui",
      gender: "Female",
      country: "Pakistan",
      timezone: "GMT+5",
      languages: ["English", "Urdu", "Arabic"],
      ijazah: true,
      hafiza: true,
      balance: 60,
      bio: "Hafiza with ijazah in Hafs an Asim. 7 years teaching children online in the UK and US — patient with young beginners and specialise in Qaida and hifdh for girls.",
      courses: ["noorani-qaida", "quran-recitation", "hifdh", "tajweed", "islamic-studies"],
      levels: [
        "Absolute beginner",
        "Noorani Qaida",
        "Reading with help (Nazra)",
        "Reads fluently",
        "Memorising Juz Amma",
        "Hifdh in progress",
      ],
    },
    {
      email: "sheikh@demo.com",
      name: "Sheikh Ahmed Al-Masri",
      gender: "Male",
      country: "Egypt",
      timezone: "GMT+2",
      languages: ["Arabic", "English"],
      ijazah: true,
      hafiza: true,
      balance: 35,
      bio: "Al-Azhar graduate, ijazah in the ten qira'at. Teaching tajweed and advanced recitation to students in North America and Europe for 12 years.",
      courses: ["quran-recitation", "tajweed", "hifdh", "arabic-language"],
      levels: ["Reads fluently", "Hifdh in progress", "Hafiz — revision only", "Reading with help (Nazra)"],
    },
  ];

  const teacherIds: Record<string, string> = {};
  for (const t of teachers) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        password: hashPassword("demo1234"),
        name: t.name,
        role: "TUTOR",
        tutorProfile: {
          create: {
            bio: t.bio,
            city: t.country,
            country: t.country,
            timezone: t.timezone,
            gender: t.gender,
            languages: JSON.stringify(t.languages),
            ijazah: t.ijazah,
            hafiz: t.hafiza,
            grades: JSON.stringify(t.levels),
            ranking: 5,
            balance: t.balance,
          },
        },
      },
      include: { tutorProfile: true },
    });
    const profileId =
      user.tutorProfile?.id ??
      (await db.tutorProfile.findUniqueOrThrow({ where: { userId: user.id } })).id;
    teacherIds[t.email] = profileId;

    for (const slug of t.courses) {
      await db.tutorService.upsert({
        where: { tutorId_serviceId: { tutorId: profileId, serviceId: serviceIds[slug] } },
        update: {},
        create: { tutorId: profileId, serviceId: serviceIds[slug] },
      });
    }
  }
  const tutorId = teacherIds["teacher@demo.com"];

  // Admin account — override the credentials via env vars on any public deploy.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@getqurantutor.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
  if (adminPassword === "admin1234") {
    console.warn(
      "⚠  Seeding the admin with the default password. Set ADMIN_EMAIL and " +
        "ADMIN_PASSWORD before seeding anything reachable from the internet."
    );
  }
  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", password: hashPassword(adminPassword) },
    create: {
      email: adminEmail,
      password: hashPassword(adminPassword),
      name: "Waleed Ansari",
      role: "ADMIN",
    },
  });

  // Demo family account
  await db.user.upsert({
    where: { email: "parent@demo.com" },
    update: {},
    create: {
      email: "parent@demo.com",
      password: hashPassword("demo1234"),
      name: "Ayesha Khan",
      role: "PARENT",
    },
  });

  if ((await db.request.count()) > 0) {
    console.log("Requests already seeded, skipping.");
    return;
  }

  const A = (pairs: [string, string][]) =>
    JSON.stringify(pairs.map(([question, answer]) => ({ question, answer })));

  const sampleRequests = [
    {
      parentName: "Yusuf A.",
      slug: "noorani-qaida",
      grade: "Absolute beginner",
      tutorGender: "Female",
      details:
        "My daughter is 6 and has never studied Arabic letters. We are in London and would like a female teacher who is gentle with young children. Evenings after 5pm UK time work best.",
      city: "London, UK",
      urgent: true,
      createdAt: hoursAgo(2),
      answers: A([
        ["Who are the classes for?", "My child (4–7 years)"],
        ["What is the student's current level?", "Absolute beginner"],
        ["Do you need a male or female teacher?", "Female teacher"],
        ["Has the student studied Arabic letters before?", "Never — starting from zero"],
        ["How often would you like classes?", "5 days a week"],
        ["How long should each class be?", "30 minutes"],
        ["What time of day suits you? (your local time)", "Late afternoon, Evening"],
        ["When would you like to start?", "As soon as possible"],
      ]),
    },
    {
      parentName: "Sumaya I.",
      slug: "hifdh",
      grade: "Memorising Juz Amma",
      tutorGender: "Female",
      details:
        "My twin daughters (9) have finished Juz Amma and want to continue full hifdh insha'Allah. Looking for a hafiza who can do daily sabaq plus revision, ideally the same teacher for both.",
      city: "Toronto, Canada",
      urgent: false,
      createdAt: hoursAgo(5),
      answers: A([
        ["Who are the classes for?", "More than one child"],
        ["What is the student's current level?", "Memorising Juz Amma"],
        ["Do you need a male or female teacher?", "Female teacher"],
        ["How much has the student memorised so far?", "Juz Amma (30th juz)"],
        ["What is the memorisation goal?", "Complete hifdh of the Quran"],
        ["Does the student also need revision (sabqi/manzil) sessions?", "Yes, include revision daily"],
        ["How often would you like classes?", "5 days a week"],
        ["How long should each class be?", "1 hour"],
        ["What time of day suits you? (your local time)", "Early morning (before school)"],
        ["When would you like to start?", "Within a week"],
      ]),
    },
    {
      parentName: "Bilal H.",
      slug: "quran-recitation",
      grade: "Reading with help (Nazra)",
      tutorGender: "Male",
      details:
        "I am 34 and can read slowly but make many mistakes. I want to complete a full nazra reading with correction. Prefer a male teacher, evenings US Eastern time.",
      city: "New Jersey, USA",
      urgent: false,
      createdAt: hoursAgo(9),
      answers: A([
        ["Who are the classes for?", "Myself (adult)"],
        ["What is the student's current level?", "Reading with help (Nazra)"],
        ["Do you need a male or female teacher?", "Male teacher"],
        ["How does the student read right now?", "Reads slowly, letter by letter"],
        ["What is your main goal?", "Complete a full reading of the Quran"],
        ["How often would you like classes?", "3 times a week"],
        ["How long should each class be?", "45 minutes"],
        ["What time of day suits you? (your local time)", "Evening"],
        ["When would you like to start?", "As soon as possible"],
      ]),
    },
    {
      parentName: "Khadija M.",
      slug: "tajweed",
      grade: "Reads fluently",
      tutorGender: "Female",
      details:
        "I read fluently but was never taught tajweed properly. Looking for a structured course covering makharij and the rules, with correction of my recitation.",
      city: "Birmingham, UK",
      urgent: false,
      createdAt: hoursAgo(14),
      answers: A([
        ["Who are the classes for?", "Myself (adult)"],
        ["What is the student's current level?", "Reads fluently"],
        ["Do you need a male or female teacher?", "Female teacher"],
        ["What level of tajweed is needed?", "Theory + application for an adult"],
        ["How often would you like classes?", "Twice a week"],
        ["How long should each class be?", "45 minutes"],
        ["What time of day suits you? (your local time)", "Weekends only"],
        ["When would you like to start?", "Within a week"],
      ]),
    },
    {
      parentName: "Omar F.",
      slug: "hifdh",
      grade: "Hifdh in progress",
      tutorGender: "Male",
      details:
        "My son is 13 and has memorised 8 juz at the local masjid, but progress stopped when we moved. Need a serious teacher for daily sabaq and manzil, 6 days a week.",
      city: "Sydney, Australia",
      urgent: true,
      createdAt: hoursAgo(20),
      answers: A([
        ["Who are the classes for?", "My teenager (13–17)"],
        ["What is the student's current level?", "Hifdh in progress"],
        ["Do you need a male or female teacher?", "Male teacher"],
        ["How much has the student memorised so far?", "6–15 juz"],
        ["What is the memorisation goal?", "Complete hifdh of the Quran"],
        ["Does the student also need revision (sabqi/manzil) sessions?", "Yes, include revision daily"],
        ["How often would you like classes?", "Daily including weekends"],
        ["How long should each class be?", "1 hour"],
        ["What time of day suits you? (your local time)", "Early morning (before school)"],
        ["When would you like to start?", "As soon as possible"],
      ]),
    },
    {
      parentName: "Nadia S.",
      slug: "islamic-studies",
      grade: "Noorani Qaida",
      tutorGender: "Female",
      details:
        "Alongside Qaida I would like my two children (5 and 7) to learn their daily duas and how to pray. Short fun classes twice a week please.",
      city: "Dublin, Ireland",
      urgent: false,
      createdAt: hoursAgo(26),
      answers: A([
        ["Who are the classes for?", "More than one child"],
        ["What is the student's current level?", "Noorani Qaida"],
        ["Do you need a male or female teacher?", "Female teacher"],
        [
          "What should the classes cover?",
          "Daily duas & adhkar, How to pray (salah), Islamic manners (adab)",
        ],
        ["How often would you like classes?", "Twice a week"],
        ["How long should each class be?", "30 minutes"],
        ["What time of day suits you? (your local time)", "Weekends only"],
        ["When would you like to start?", "Within a month"],
      ]),
    },
    {
      parentName: "Ibrahim T.",
      slug: "arabic-language",
      grade: "Reads fluently",
      tutorGender: "No preference",
      details:
        "I can recite but understand nothing. Looking for Quranic Arabic — vocabulary and enough grammar to follow the meaning while reading.",
      city: "Manchester, UK",
      urgent: false,
      createdAt: hoursAgo(34),
      answers: A([
        ["Who are the classes for?", "Myself (adult)"],
        ["What is the student's current level?", "Reads fluently"],
        ["Do you need a male or female teacher?", "No preference"],
        ["Which type of Arabic do you want?", "Quranic Arabic (understand the meaning)"],
        ["How often would you like classes?", "Twice a week"],
        ["How long should each class be?", "1 hour"],
        ["What time of day suits you? (your local time)", "Evening"],
        ["When would you like to start?", "Within a week"],
      ]),
    },
    {
      parentName: "Aisha R.",
      slug: "noorani-qaida",
      grade: "Noorani Qaida",
      tutorGender: "Female",
      details:
        "My son (7) knows the letters but cannot join them yet. His previous teacher moved. Female teacher preferred as classes are at home with the girls too.",
      city: "Doha, Qatar",
      urgent: false,
      createdAt: hoursAgo(44),
      answers: A([
        ["Who are the classes for?", "My child (4–7 years)"],
        ["What is the student's current level?", "Noorani Qaida"],
        ["Do you need a male or female teacher?", "Female teacher"],
        ["Has the student studied Arabic letters before?", "Knows letters, struggles to join them"],
        ["How often would you like classes?", "3 times a week"],
        ["How long should each class be?", "30 minutes"],
        ["What time of day suits you? (your local time)", "Late afternoon"],
        ["When would you like to start?", "Within a week"],
      ]),
    },
  ];

  const created: string[] = [];
  for (const r of sampleRequests) {
    const rec = await db.request.create({
      data: {
        parentName: r.parentName,
        serviceId: serviceIds[r.slug],
        answers: r.answers,
        grade: r.grade,
        tutorGender: r.tutorGender === "No preference" ? "" : r.tutorGender,
        details: r.details,
        mode: "Online",
        city: r.city,
        urgent: r.urgent,
        createdAt: r.createdAt,
      },
    });
    created.push(rec.id);
  }

  // Quotes already sent by the demo teacher — one pending, one won
  await db.quote.create({
    data: {
      requestId: created[3],
      tutorId,
      price: 14,
      message:
        "As-salamu alaykum. I teach tajweed to sisters using a structured 12-week course — makharij first, then the rules applied to your own recitation each class. I hold an ijazah in Hafs an Asim. First class is free so you can see the method.",
      sharePhone: true,
      createdAt: hoursAgo(12),
    },
  });
  await db.quote.create({
    data: {
      requestId: created[7],
      tutorId,
      price: 10,
      message:
        "Wa alaykum as-salam. I specialise in exactly this stage — joining letters with the Noorani Qaida using visual cards over video. Alhamdulillah most children start reading short words within 6 weeks. Happy to do a free trial class.",
      sharePhone: true,
      status: "WON",
      createdAt: hoursAgo(42),
    },
  });
  await db.request.update({ where: { id: created[7] }, data: { status: "CLOSED" } });

  await db.walletTransaction.createMany({
    data: [
      { tutorId, amount: 50, type: "TOPUP", note: "Wallet top-up", createdAt: hoursAgo(72) },
      {
        tutorId,
        amount: -5,
        type: "QUOTE_FEE",
        note: "Quote: Noorani Qaida — Aisha R.",
        createdAt: hoursAgo(42),
      },
      { tutorId, amount: 20, type: "TOPUP", note: "Wallet top-up", createdAt: hoursAgo(24) },
      {
        tutorId,
        amount: -5,
        type: "QUOTE_FEE",
        note: "Quote: Tajweed — Khadija M.",
        createdAt: hoursAgo(12),
      },
    ],
  });

  console.log("Seed complete.");
}

main().finally(() => db.$disconnect());
