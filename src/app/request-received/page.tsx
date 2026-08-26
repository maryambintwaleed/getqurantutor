import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function RequestReceived() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500" />
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Request received!</h1>
          <p className="mt-3 text-slate-500">
            Verified teachers who match your level, timings and gender preference are being
            notified now. Create a free account to compare the quotes they send you.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Create account
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:border-brand-600"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
