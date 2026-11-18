"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, register, type AuthState } from "@/actions/auth";

/**
 * Never hardcode demo credentials: anything in this file ships inside the
 * public JavaScript bundle, rendered or not. The hint only exists where the
 * environment supplies it — set NEXT_PUBLIC_DEMO_HINT locally, never in
 * production.
 */
const DEMO_HINT = process.env.NEXT_PUBLIC_DEMO_HINT;

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-semibold text-brand-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
      {DEMO_HINT && (
        <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
          Demo accounts — {DEMO_HINT}
        </div>
      )}
    </form>
  );
}

export function RegisterForm({
  initialRole,
  next,
}: {
  initialRole: "PARENT" | "SCHOOL" | "TUTOR";
  next?: string;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  const [uiRole, setUiRole] = useState<"PARENT" | "SCHOOL" | "TUTOR">(initialRole);
  const dbRole = uiRole === "TUTOR" ? "TUTOR" : "PARENT";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={dbRole} />
      <input type="hidden" name="accountType" value={uiRole} />
      {next && <input type="hidden" name="next" value={next} />}
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
        {(["PARENT", "SCHOOL", "TUTOR"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setUiRole(r)}
            className={`rounded-lg px-2 py-2.5 text-xs sm:text-sm font-semibold transition ${
              uiRole === r ? "bg-white text-brand-700 shadow" : "text-slate-500"
            }`}
          >
            {r === "PARENT"
              ? "I am a student/guardian"
              : r === "SCHOOL"
                ? "I am a school"
                : "I'm a teacher"}
          </button>
        ))}
      </div>
      {uiRole === "SCHOOL" && (
        <p className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-xs sm:text-sm text-brand-800">
          🏫 <b>Hiring for a school or academy?</b> Post your requirements for free and let verified teachers apply directly to you.
        </p>
      )}
      <input
        name="name"
        required
        placeholder={uiRole === "SCHOOL" ? "School or Academy name" : "Full name"}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={uiRole === "SCHOOL" ? "School contact email" : "Email"}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Password (min 6 characters)"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
      {uiRole === "TUTOR" && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">I am a</p>
            <div className="grid grid-cols-2 gap-2">
              {["Male", "Female"].map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-brand-400"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    defaultChecked={g === "Male"}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {g === "Male" ? "Male teacher (ustadh)" : "Female teacher (ustadha)"}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Families often request a specific gender — you will only be shown matching requests.
            </p>
          </div>
          <p className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
            🎁 New teachers get <b>20 free credits</b> to send their first quotes.
          </p>
        </>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-xs text-slate-500">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-brand-600 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-semibold text-brand-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
