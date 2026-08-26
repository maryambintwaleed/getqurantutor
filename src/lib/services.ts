export type WizardQuestion = {
  question: string;
  options: string[];
  multi?: boolean;
};

/** Student levels — the Quran equivalent of school grades. */
export const ALL_GRADES = [
  "Absolute beginner",
  "Noorani Qaida",
  "Reading with help (Nazra)",
  "Reads fluently",
  "Memorising Juz Amma",
  "Hifdh in progress",
  "Hafiz — revision only",
];

export const GRADE_QUESTION_TEXT = "What is the student's current level?";

export const TUTOR_GENDER_QUESTION = "Do you need a male or female teacher?";
export const GENDER_OPTIONS = ["Female teacher", "Male teacher", "No preference"];

export const ALL_LANGUAGES = [
  "English",
  "Arabic",
  "Urdu",
  "Bengali",
  "Turkish",
  "French",
  "Malay",
  "Somali",
];

export type ServiceDef = {
  slug: string;
  name: string;
  short: string;
  description: string;
  emoji: string;
  priceMin: number;
  priceMax: number;
  grades: string[];
  questions: WizardQuestion[];
};

const STUDENT_QUESTION: WizardQuestion = {
  question: "Who are the classes for?",
  options: [
    "My child (4–7 years)",
    "My child (8–12 years)",
    "My teenager (13–17)",
    "Myself (adult)",
    "More than one child",
  ],
};

const FREQUENCY_QUESTION: WizardQuestion = {
  question: "How often would you like classes?",
  options: [
    "Twice a week",
    "3 times a week",
    "5 days a week",
    "Daily including weekends",
    "Not sure yet — need advice",
  ],
};

const DURATION_QUESTION: WizardQuestion = {
  question: "How long should each class be?",
  options: ["30 minutes", "45 minutes", "1 hour", "More than 1 hour"],
};

const TIME_QUESTION: WizardQuestion = {
  question: "What time of day suits you? (your local time)",
  multi: true,
  options: [
    "Early morning (before school)",
    "Late afternoon",
    "Evening",
    "Weekends only",
    "Flexible",
  ],
};

const START_QUESTION: WizardQuestion = {
  question: "When would you like to start?",
  options: ["As soon as possible", "Within a week", "Within a month", "Just exploring for now"],
};

const GENDER_QUESTION: WizardQuestion = {
  question: TUTOR_GENDER_QUESTION,
  options: GENDER_OPTIONS,
};

export const SERVICES: ServiceDef[] = [
  {
    slug: "noorani-qaida",
    name: "Noorani Qaida (Beginners)",
    short: "Arabic letters to first words",
    description:
      "Step-by-step foundation course — Arabic letters, sounds, harakat and joining letters, so a complete beginner can start reading the Quran.",
    emoji: "🔤",
    priceMin: 6,
    priceMax: 15,
    grades: ["Absolute beginner", "Noorani Qaida"],
    questions: [
      STUDENT_QUESTION,
      GENDER_QUESTION,
      {
        question: "Has the student studied Arabic letters before?",
        options: [
          "Never — starting from zero",
          "Knows some letters",
          "Knows letters, struggles to join them",
          "Restarting after a long gap",
        ],
      },
      FREQUENCY_QUESTION,
      DURATION_QUESTION,
      TIME_QUESTION,
      START_QUESTION,
    ],
  },
  {
    slug: "quran-recitation",
    name: "Quran Recitation (Nazra)",
    short: "Read the Quran fluently",
    description:
      "Guided reading of the Quran from the mushaf — fluency, correct pronunciation and confidence, one page at a time.",
    emoji: "📖",
    priceMin: 7,
    priceMax: 18,
    grades: [
      "Noorani Qaida",
      "Reading with help (Nazra)",
      "Reads fluently",
    ],
    questions: [
      STUDENT_QUESTION,
      GENDER_QUESTION,
      {
        question: "How does the student read right now?",
        options: [
          "Just finished Qaida",
          "Reads slowly, letter by letter",
          "Reads with mistakes in pronunciation",
          "Reads well — wants to polish",
        ],
      },
      {
        question: "What is your main goal?",
        options: [
          "Complete a full reading of the Quran",
          "Improve fluency and speed",
          "Fix pronunciation (makharij)",
          "Build a daily reading habit",
        ],
      },
      FREQUENCY_QUESTION,
      DURATION_QUESTION,
      TIME_QUESTION,
      START_QUESTION,
    ],
  },
  {
    slug: "hifdh",
    name: "Hifdh (Memorisation)",
    short: "Memorise with a structured plan",
    description:
      "One-to-one memorisation with daily sabaq, sabqi and manzil revision — from Juz Amma to the full Quran, tracked page by page.",
    emoji: "🕌",
    priceMin: 10,
    priceMax: 30,
    grades: [
      "Reads fluently",
      "Memorising Juz Amma",
      "Hifdh in progress",
      "Hafiz — revision only",
    ],
    questions: [
      STUDENT_QUESTION,
      GENDER_QUESTION,
      {
        question: "How much has the student memorised so far?",
        options: [
          "Nothing yet — starting hifdh",
          "A few short surahs",
          "Juz Amma (30th juz)",
          "1–5 juz",
          "6–15 juz",
          "More than 15 juz",
        ],
      },
      {
        question: "What is the memorisation goal?",
        options: [
          "Juz Amma only",
          "Selected surahs (Yaseen, Mulk, Kahf…)",
          "Complete hifdh of the Quran",
          "Revision & strengthening existing hifdh",
        ],
      },
      {
        question: "Does the student also need revision (sabqi/manzil) sessions?",
        options: ["Yes, include revision daily", "Revision a few times a week", "New lesson only"],
      },
      FREQUENCY_QUESTION,
      DURATION_QUESTION,
      TIME_QUESTION,
      START_QUESTION,
    ],
  },
  {
    slug: "tajweed",
    name: "Tajweed Rules",
    short: "Recite the way it was revealed",
    description:
      "Rules of tajweed applied in practice — makharij, sifaat, noon sakinah, madd — with correction from a qualified teacher.",
    emoji: "🎧",
    priceMin: 8,
    priceMax: 25,
    grades: ["Reading with help (Nazra)", "Reads fluently", "Hifdh in progress", "Hafiz — revision only"],
    questions: [
      STUDENT_QUESTION,
      GENDER_QUESTION,
      {
        question: "What level of tajweed is needed?",
        options: [
          "Basic rules for a child",
          "Theory + application for an adult",
          "Correcting long-standing mistakes",
          "Advanced — preparing for ijazah",
        ],
      },
      FREQUENCY_QUESTION,
      DURATION_QUESTION,
      TIME_QUESTION,
      START_QUESTION,
    ],
  },
  {
    slug: "arabic-language",
    name: "Arabic Language",
    short: "Understand what you recite",
    description:
      "Quranic and conversational Arabic — vocabulary, grammar (nahw & sarf) and understanding the meaning of what you read.",
    emoji: "✍️",
    priceMin: 8,
    priceMax: 25,
    grades: ["Absolute beginner", "Reading with help (Nazra)", "Reads fluently"],
    questions: [
      STUDENT_QUESTION,
      GENDER_QUESTION,
      {
        question: "Which type of Arabic do you want?",
        options: [
          "Quranic Arabic (understand the meaning)",
          "Modern conversational Arabic",
          "Classical grammar (nahw & sarf)",
          "Not sure — need advice",
        ],
      },
      FREQUENCY_QUESTION,
      DURATION_QUESTION,
      TIME_QUESTION,
      START_QUESTION,
    ],
  },
  {
    slug: "islamic-studies",
    name: "Islamic Studies for Kids",
    short: "Duas, seerah and daily practice",
    description:
      "Age-appropriate lessons in aqeedah, seerah, daily duas, salah and manners — taught gently alongside Quran classes.",
    emoji: "🌙",
    priceMin: 6,
    priceMax: 18,
    grades: ["Absolute beginner", "Noorani Qaida", "Reading with help (Nazra)", "Reads fluently"],
    questions: [
      STUDENT_QUESTION,
      GENDER_QUESTION,
      {
        question: "What should the classes cover?",
        multi: true,
        options: [
          "Daily duas & adhkar",
          "How to pray (salah)",
          "Seerah & stories of the prophets",
          "Aqeedah basics",
          "Islamic manners (adab)",
          "Ramadan & pillars of Islam",
        ],
      },
      FREQUENCY_QUESTION,
      DURATION_QUESTION,
      TIME_QUESTION,
      START_QUESTION,
    ],
  },
];

export function getService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Builds the wizard question list for a service. Categories created by admins
 * have no code-defined questions, so they get a sensible generic set. The
 * level question is injected from the levels configured on the DB record.
 */
export function buildQuestions(slug: string, grades: string[]): WizardQuestion[] {
  const def = getService(slug);
  const base: WizardQuestion[] = def
    ? [...def.questions]
    : [
        STUDENT_QUESTION,
        { question: TUTOR_GENDER_QUESTION, options: GENDER_OPTIONS },
        FREQUENCY_QUESTION,
        DURATION_QUESTION,
        TIME_QUESTION,
        START_QUESTION,
      ];
  if (grades.length > 0) {
    base.splice(1, 0, { question: GRADE_QUESTION_TEXT, options: grades });
  }
  return base;
}

export const QUOTE_FEE = 5; // credits per quote sent
