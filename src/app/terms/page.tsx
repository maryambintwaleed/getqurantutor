import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing the use of GetQuranTutor by families, students, and independent Quran tutors.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 sm:p-12 shadow-sm border border-slate-100">
          <header className="border-b border-slate-100 pb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Legal Agreement
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Last updated: October 2026 · Effective immediately
            </p>
          </header>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
            {/* Section 1 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2">
                Welcome to <strong>GetQuranTutor</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), accessible at{" "}
                <a href="https://getqurantutor.com" className="text-brand-600 hover:underline">
                  getqurantutor.com
                </a>
                . By accessing, browsing, registering on, or using our platform, you agree to be
                bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy. If you do not
                agree with any part of these Terms, you must discontinue using our services
                immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                2. Overview of the Platform
              </h2>
              <p className="mt-2">
                GetQuranTutor is an online marketplace platform connecting Muslim families and
                students seeking Quranic, Tajweed, Arabic, and Islamic studies education with
                independent qualified tutors. GetQuranTutor provides matchmaking tools, profile
                verification, and communication channels.
              </p>
              <p className="mt-2">
                Tutors operate as independent educators and are not employees, agents, or partners
                of GetQuranTutor. While we conduct verification checks (including Tajweed voice
                reviews), tutors set their own teaching schedules, methods, and agreements with
                students.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                3. User Accounts &amp; Registration
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Account Accuracy:</strong> You agree to provide true, accurate, and current
                  information during registration and to keep your credentials confidential.
                </li>
                <li>
                  <strong>Minors &amp; Children:</strong> For students under 18 years of age, accounts
                  must be registered and managed by a parent or legal guardian. Parents are
                  encouraged to attend or monitor online lessons.
                </li>
                <li>
                  <strong>Account Security:</strong> You are responsible for all activities occurring
                  under your account. Notify us immediately at support@getqurantutor.com if you
                  suspect unauthorized access.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                4. Terms for Quran Tutors
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Verification &amp; Voice Recording:</strong> To ensure high recitation
                  standards for students, all tutors must submit a clear Quran recitation audio
                  recording via our website. Profiles remain pending and will not receive student
                  inquiries until reviewed and approved by our verification team.
                </li>
                <li>
                  <strong>Quotes &amp; Pricing:</strong> Tutors may respond to student requests by
                  submitting quotes. Tutors must clearly specify their proposed rate (e.g., per
                  session or monthly) and lesson structure.
                </li>
                <li>
                  <strong>No Guarantee of Student Volume:</strong> Approval on the platform does not
                  guarantee a fixed number of student inquiries or earnings. Inquiry volume depends on
                  matching student demand, scheduling, and profile completeness.
                </li>
                <li>
                  <strong>Conduct:</strong> Tutors agree to teach with patience, respect, and high
                  Islamic ethical standards, adhering strictly to child safeguarding policies.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                5. Terms for Students &amp; Families
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Free for Families:</strong> Submitting a lesson request and receiving quotes
                  from verified tutors on GetQuranTutor is completely free for families.
                </li>
                <li>
                  <strong>Trial Lessons:</strong> Many tutors offer an introductory free or discounted
                  trial lesson. Families and tutors must agree mutually on scheduling and ongoing
                  lesson commitments.
                </li>
                <li>
                  <strong>Punctuality &amp; Respect:</strong> Students and parents agree to treat tutors
                  with mutual courtesy and provide reasonable notice for session cancellations or
                  rescheduling.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                6. Safeguarding &amp; Code of Conduct
              </h2>
              <p className="mt-2">
                We maintain a strict zero-tolerance policy for harassment, abusive language,
                inappropriate behavior, discrimination, or any conduct that violates child
                protection principles or Islamic values. Any user found violating these standards
                will have their account permanently suspended without notice.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                7. Copyright &amp; Intellectual Property
              </h2>
              <p className="mt-2">
                All content on this website, including but not limited to text, graphics, logos,
                icons, images, audio clips, code, and software, is the exclusive property of{" "}
                <strong>GetQuranTutor</strong> or its content suppliers and is protected by
                international copyright, trademark, and intellectual property laws.
              </p>
              <p className="mt-2">
                You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the
                platform or our proprietary materials without express prior written permission from
                GetQuranTutor.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                8. Limitation of Liability
              </h2>
              <p className="mt-2">
                GetQuranTutor provides the platform on an &quot;as-is&quot; and &quot;as-available&quot;
                basis. While we diligently verify tutor qualifications, we do not guarantee the
                accuracy of third-party representations or the outcome of any tutoring session. To
                the fullest extent permitted by applicable law, GetQuranTutor shall not be liable for
                any indirect, incidental, or consequential damages resulting from your use of the
                platform.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                9. Changes to Terms
              </h2>
              <p className="mt-2">
                We may revise these Terms from time to time. When changes are made, we will update the
                &quot;Last updated&quot; date at the top of this page. Your continued use of the
                platform after such updates constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                10. Contact Us
              </h2>
              <p className="mt-2">
                If you have any questions or concerns regarding these Terms of Service, please
                reach out to our support team:
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-4 border border-slate-200 text-slate-700">
                <p><strong>GetQuranTutor Support</strong></p>
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
