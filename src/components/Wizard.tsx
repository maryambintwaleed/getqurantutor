"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft } from "lucide-react";
import type { WizardQuestion } from "@/lib/services";
import { createRequest } from "@/actions/requests";
import { COMMON_COUNTRIES, COUNTRIES } from "@/lib/geo";
import SearchableSelect, { type SelectOption } from "@/components/SearchableSelect";

// Common countries first so the usual answer is one keystroke away.
const countryOptions: SelectOption[] = [
  ...COMMON_COUNTRIES.map((c) => ({ value: c, label: c })),
  ...COUNTRIES.filter((c) => !COMMON_COUNTRIES.includes(c)).map((c) => ({ value: c, label: c })),
];

export type WizardService = {
  slug: string;
  name: string;
  emoji: string;
  questions: WizardQuestion[];
};

export default function Wizard({ service }: { service: WizardService }) {
  const router = useRouter();
  const totalSteps = service.questions.length + 1; // + final details step
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(service.questions.length).fill("")
  );
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isFinal = step === service.questions.length;
  const question = !isFinal ? service.questions[step] : null;
  const progress = ((step + 1) / totalSteps) * 100;

  function pick(option: string) {
    const next = [...answers];
    next[step] = option;
    setAnswers(next);
    setStep(step + 1);
    setMultiSelection([]);
  }

  function toggleMulti(option: string) {
    setMultiSelection((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  }

  function continueMulti() {
    if (multiSelection.length === 0) return;
    const next = [...answers];
    next[step] = multiSelection.join(", ");
    setAnswers(next);
    setStep(step + 1);
    setMultiSelection([]);
  }

  function back() {
    if (step === 0) {
      router.push("/");
      return;
    }
    if (!isFinal && service.questions[step - 1].multi) {
      setMultiSelection(answers[step - 1] ? answers[step - 1].split(", ") : []);
    }
    setStep(step - 1);
  }

  function submit() {
    if (!parentName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Please enter an email address so we can send you the teachers' replies.");
      return;
    }
    setError("");
    startTransition(async () => {
      await createRequest({
        slug: service.slug,
        answers: service.questions.map((q, i) => ({
          question: q.question,
          answer: answers[i],
        })),
        details,
        parentName: parentName.trim(),
        email: email.trim(),
        city: country, // the location column now holds a country picked from the list
        urgent: false,
      });
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900/40 px-4 py-8">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative border-b border-slate-100 px-6 py-4 text-center">
          <button
            onClick={back}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="px-12 font-semibold text-slate-900">
            {service.emoji} {service.name}
          </h1>
          <button
            onClick={() => router.push("/")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {question ? (
            <>
              <h2 className="text-xl font-bold text-slate-900">{question.question}</h2>
              <div className="mt-5 space-y-1">
                {question.options.map((option) => {
                  const selected = question.multi
                    ? multiSelection.includes(option)
                    : answers[step] === option;
                  return (
                    <button
                      key={option}
                      onClick={() =>
                        question.multi ? toggleMulti(option) : pick(option)
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-brand-50 ${
                        selected ? "bg-brand-50" : ""
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition ${
                          question.multi ? "rounded-md" : "rounded-full"
                        } ${
                          selected
                            ? "border-brand-600 bg-brand-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && (
                          <span
                            className={
                              question.multi
                                ? "text-[11px] font-bold text-white"
                                : "h-2 w-2 rounded-full bg-white"
                            }
                          >
                            {question.multi ? "✓" : ""}
                          </span>
                        )}
                      </span>
                      <span className="text-slate-800">{option}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900">Almost done!</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a few details so teachers can send you an accurate quote. We will email
                you as soon as a teacher replies.
              </p>
              <div className="mt-5 space-y-4">
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Anything else the teacher should know? (age, past experience, specific surahs, timings…)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="Your email *"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Your name *"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                  />
                  <SearchableSelect
                    ariaLabel="Your country"
                    placeholder="Your country (optional)"
                    value={country}
                    onChange={setCountry}
                    options={countryOptions}
                    emptyText="No country matches that"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4">
          {question?.multi ? (
            <>
              <button
                onClick={continueMulti}
                disabled={multiSelection.length === 0}
                className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
              >
                Continue
                {multiSelection.length > 0 && ` (${multiSelection.length} selected)`}
              </button>
              {multiSelection.length === 0 && (
                <p className="mt-2 text-center text-xs text-slate-400">
                  Choose at least one option — you can pick several.
                </p>
              )}
            </>
          ) : isFinal ? (
            <button
              onClick={submit}
              disabled={pending}
              className="w-full rounded-xl bg-accent-500 py-3.5 font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Get quotes from teachers"}
            </button>
          ) : (
            <p className="text-center text-xs text-slate-400">
              Select an option to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
