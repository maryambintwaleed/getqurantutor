/**
 * AI Support Knowledge Base and Intelligent Response Engine for GetQuranTutor
 */

interface KnowledgeTopic {
  keywords: string[];
  title: string;
  response: string;
  actionButtons?: { label: string; url: string }[];
}

const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    keywords: ["female", "sister", "woman", "girl", "lady", "gender"],
    title: "Female Quran Tutors",
    response: `**Finding Female Quran Tutors on GetQuranTutor:**

Yes! We have many verified female Quran teachers (Hafiza & Ijazah holders) available for sisters, girls, and children.

1. Click **"Find a Tutor"** on the home page.
2. In the request form, select your preference for **Female Teacher**.
3. Verified female teachers will review your request and send you direct quotes.`,
    actionButtons: [
      { label: "Request a Female Tutor", url: "/request/quran-recitation" },
    ],
  },
  {
    keywords: ["free", "cost", "price", "fee", "pay", "charge", "rate", "parent", "family"],
    title: "Pricing & Cost for Families",
    response: `**Is GetQuranTutor free for parents?**

Yes! Requesting tutors on GetQuranTutor is **100% FREE for parents and families**. 

- You post what you need (e.g. 3 classes/week for kids).
- Verified tutors respond with their exact hourly or monthly rates (typically ranging from **$10 to $40/hour** depending on teacher experience, Ijazah, and frequency).
- You compare quotes, listen to audio samples, and choose the tutor that best fits your budget.`,
    actionButtons: [
      { label: "Post a Free Request", url: "/request/quran-recitation" },
    ],
  },
  {
    keywords: ["verify", "verification", "approved", "id", "safe", "background", "document"],
    title: "Tutor Verification & Safety",
    response: `**How are tutors verified on GetQuranTutor?**

Safety and authenticity are our top priorities:

1. **Identity Check**: Tutors submit official ID documentation reviewed manually by our Admin team.
2. **Quran Recitation Audit**: Tutors submit audio recitations to verify their Tajweed, makharij, and pronunciation.
3. **Badges**: Look for **Hafiz** (memorized full Quran) and **Ijazah** (certified teaching chain) badges on tutor profiles.
4. Tutors cannot send quotes until their profile is approved by Admin.`,
  },
  {
    keywords: ["credit", "wallet", "balance", "tutor pay", "opportunit", "topup", "fee"],
    title: "Tutor Credits & Quotes",
    response: `**How do quotes and wallet credits work for Tutors?**

- Tutors maintain a credit wallet to submit quotes on family requests.
- Each quote costs a small fee from your balance.
- You can manage your wallet, view transaction history, and top up credits directly from your **Pro Dashboard**.`,
    actionButtons: [
      { label: "Go to Wallet", url: "/pro/wallet" },
      { label: "View Opportunities", url: "/pro/opportunities" },
    ],
  },
  {
    keywords: ["ijazah", "hafiz", "sanad", "certif", "tajweed"],
    title: "Ijazah & Hafiz Certifications",
    response: `**What do the Ijazah and Hafiz badges mean?**

- **Hafiz / Hafiza**: The teacher has fully memorized all 30 Juz of the Holy Quran.
- **Ijazah (Sanad)**: The teacher possesses a formal certification with an unbroken chain of narration back to the Prophet Muhammad (ﷺ) to teach Quran recitation and Tajweed.`,
  },
  {
    keywords: ["register", "become tutor", "teacher sign", "join as teacher", "apply"],
    title: "Become a Quran Tutor",
    response: `**How do I join as a Quran Teacher?**

1. Register as a **Tutor** on GetQuranTutor.
2. Complete your teacher profile (bio, subjects, teaching languages).
3. Upload your ID document and record an audio recitation sample.
4. Once our team approves your profile, you will start receiving tutoring requests from families around the world!`,
    actionButtons: [
      { label: "Register as Tutor", url: "/register" },
    ],
  },
  {
    keywords: ["contact", "human", "admin", "agent", "support", "help", "whatsapp", "phone", "email", "speak"],
    title: "Live Support & Contact",
    response: `**Need to reach our human team directly?**

Our support team is here to assist you!

- **WhatsApp Support**: Chat with us instantly on WhatsApp for urgent queries.
- **Admin Inbox**: Your message is saved in our system. An admin will also review this chat and reply right here!`,
    actionButtons: [
      { label: "Chat on WhatsApp", url: "https://wa.me/15551234567?text=Hello%20GetQuranTutor%20Support" },
    ],
  },
];

export function generateAIResponse(userMessage: string): {
  reply: string;
  suggestedAction?: { label: string; url: string };
} {
  const normalized = userMessage.toLowerCase().trim();

  // Search knowledge base
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      const action = item.actionButtons ? item.actionButtons[0] : undefined;
      return {
        reply: item.response,
        suggestedAction: action,
      };
    }
  }

  // General fallback response
  return {
    reply: `Thank you for reaching out to **GetQuranTutor Support**! 

I'm your AI assistant. Here is quick information about our platform:

- **For Parents**: You can request verified male or female Quran tutors for free and receive custom quotes within hours.
- **For Tutors**: You can create a tutor profile, get verified by uploading ID & audio samples, and quote on student requests.

Your message has been saved for our **Admin Team**. If you'd like immediate assistance or to speak with a human agent, you can also reach us directly via WhatsApp.`,
    suggestedAction: {
      label: "Chat on WhatsApp",
      url: "https://wa.me/15551234567?text=Hello%20GetQuranTutor%20Support",
    },
  };
}
