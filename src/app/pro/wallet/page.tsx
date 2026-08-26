import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { topUp } from "@/actions/tutor";
import { timeAgo } from "@/lib/format";
import { QUOTE_FEE } from "@/lib/services";

const PACKS = [20, 50, 100];

export default async function WalletPage() {
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;

  const transactions = await db.walletTransaction.findMany({
    where: { tutorId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">My Wallet</h1>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Wallet size={22} />
          </span>
          <div>
            <p className="text-sm text-brand-100">Current balance</p>
            <p className="text-3xl font-bold">{profile.balance} credits</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-brand-100">
          Each quote you send costs {QUOTE_FEE} credits. You only pay to reach parents — winning
          the job is free.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-900">Add credits</h2>
        <p className="mt-1 text-sm text-slate-500">
          Demo mode — credits are added instantly, no payment needed. A payment gateway plugs in
          here later.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {PACKS.map((amount) => (
            <form key={amount} action={topUp}>
              <input type="hidden" name="amount" value={amount} />
              <button className="w-full rounded-xl border-2 border-slate-200 py-4 text-center transition hover:border-brand-500 hover:bg-brand-50">
                <span className="block text-xl font-bold text-slate-900">+{amount}</span>
                <span className="text-xs text-slate-500">credits</span>
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">
          Transaction history
        </h2>
        {transactions.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No transactions yet.</p>
        )}
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 border-b border-slate-50 px-6 py-4 last:border-0"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                t.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              }`}
            >
              {t.amount > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{t.note}</p>
              <p className="text-xs text-slate-400">{timeAgo(t.createdAt)}</p>
            </div>
            <span
              className={`font-semibold ${t.amount > 0 ? "text-green-600" : "text-slate-900"}`}
            >
              {t.amount > 0 ? "+" : ""}
              {t.amount}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
