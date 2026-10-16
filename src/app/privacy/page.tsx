import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how GetQuranTutor collects, uses, and safeguards your personal data, audio verification recordings, and communications.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 sm:p-12 shadow-sm border border-slate-100">
          <header className="border-b border-slate-100 pb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Your Privacy Matters
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Last updated: October 2026 · Effective immediately
            </p>
          </header>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
            {/* Section 1 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                1. Introduction
              </h2>
              <p className="mt-2">
                At <strong>GetQuranTutor</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we respect your privacy
                and are committed to protecting the personal information you share with us. This
                Privacy Policy explains how we collect, use, disclose, and safeguard your data when
                you visit our website at{" "}
                <a href="https://getqurantutor.com" className="text-brand-600 hover:underline">
                  getqurantutor.com
                </a>{" "}
                or use our tutoring matchmaking services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                2. Information We Collect
              </h2>
              <p className="mt-2">We collect information that you voluntarily provide to us:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Account &amp; Contact Details:</strong> Name, email address, phone number,
                  and country/timezone when creating an account or submitting an inquiry.
                </li>
                <li>
                  <strong>Student Requests:</strong> Learning goals (e.g., Noorani Qaida, Tajweed,
                  Hifz), student age/level, preferred days/times, and teacher gender preferences.
                </li>
                <li>
                  <strong>Tutor Profiles:</strong> Qualifications, teaching experience, biography,
                  hourly/session rates, spoken languages, and availability.
                </li>
                <li>
                  <strong>Verification Audio Recordings:</strong> To ensure high recitation standards,
                  tutors upload a Quran recitation voice recording to verify their Tajweed and
                  pronunciation.
                </li>
                <li>
                  <strong>Support Communications:</strong> Messages and questions sent through our
                  live chat, email, or WhatsApp customer service channels.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                3. How We Use Your Information
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>To connect students and families with suitable, qualified Quran tutors.</li>
                <li>
                  To review and verify tutor recitation credentials before approving profiles.
                </li>
                <li>To enable communication and quotes exchange between tutors and families.</li>
                <li>To provide live customer support, answer questions, and resolve issues.</li>
                <li>
                  To maintain platform security, prevent fraudulent activity, and comply with legal
                  obligations.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                4. Protection of Audio Voice Recordings
              </h2>
              <p className="mt-2">
                Tutor recitation voice recordings uploaded for verification are reviewed solely by
                our qualified verification reviewers to evaluate Tajweed, Makharij, and recitation
                proficiency. We do not sell, license, or use your audio recordings for any purpose
                other than tutor assessment and platform verification.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                5. Data Sharing &amp; Disclosure
              </h2>
              <p className="mt-2">
                <strong>We do not sell your personal information.</strong> We only share data in the
                following limited circumstances:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Between Tutors and Families:</strong> When a tutor sends a quote or a family
                  initiates contact, relevant profile and request details are shared to facilitate
                  the tutoring connection.
                </li>
                <li>
                  <strong>Service Providers:</strong> Trusted third-party hosting, database, and email
                  infrastructure providers who assist us in operating our platform under strict
                  confidentiality agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If required by law, subpoena, or to protect the
                  safety, rights, and property of our users or the public.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                6. Children&apos;s Privacy &amp; Safeguarding
              </h2>
              <p className="mt-2">
                Protecting the privacy and safety of children is our utmost priority. We do not
                knowingly collect personal data directly from children under 13 without verifiable
                family consent. All student accounts for minors must be set up, supervised, and
                managed by a family member or legal guardian.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                7. Data Security &amp; Retention
              </h2>
              <p className="mt-2">
                We implement robust technical and organizational security measures to protect your
                personal information from unauthorized access, loss, or misuse. We retain your data
                only for as long as necessary to fulfill the purposes described in this policy, unless
                a longer retention period is required by law.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                8. Your Rights &amp; Choices
              </h2>
              <p className="mt-2">
                Depending on your location, you may have rights under applicable privacy laws (such as
                GDPR or CCPA), including:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>The right to access and receive a copy of your personal data.</li>
                <li>The right to rectify inaccurate or incomplete information.</li>
                <li>The right to request deletion of your account and associated personal data.</li>
                <li>The right to object to or restrict certain data processing activities.</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:support@getqurantutor.com" className="text-brand-600 hover:underline">
                  support@getqurantutor.com
                </a>
                .
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                9. Contact Information
              </h2>
              <p className="mt-2">
                If you have questions, comments, or requests regarding this Privacy Policy, please
                contact us:
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-4 border border-slate-200 text-slate-700">
                <p><strong>GetQuranTutor Privacy Team</strong></p>
                <p>Website: <a href="https://getqurantutor.com" className="text-brand-600 hover:underline">getqurantutor.com</a></p>
                <p>Email: <a href="mailto:support@getqurantutor.com" className="text-brand-600 hover:underline">support@getqurantutor.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
