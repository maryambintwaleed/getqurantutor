"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, register, type AuthState } from "@/actions/auth";

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
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
      <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
        Demo accounts — teacher: <b>teacher@demo.com</b> · parent: <b>parent@demo.com</b> ·
        password: <b>demo1234</b>
      </div>
    </form>
  );
}

export function RegisterForm({ initialRole }: { initialRole: "PARENT" | "TUTOR" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  const [role, setRole] = useState<"PARENT" | "TUTOR">(initialRole);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {(["PARENT", "TUTOR"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              role === r ? "bg-white text-brand-700 shadow" : "text-slate-500"
            }`}
          >
            {r === "PARENT" ? "I'm a parent" : "I'm a teacher"}
          </button>
        ))}
      </div>
      <input
        name="name"
        required
        placeholder="Full name"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
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
        minLength={6}
        placeholder="Password (min 6 characters)"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
      />
      {role === "TUTOR" && (
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
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
