import Link from "next/link";
import { GraduationCap, Users, Inbox, FileText, Trophy, Coins, MessageSquare } from "lucide-react";
import { db } from "@/lib/db";

export default async function AdminOverview() {
  const [tutors, parents, openRequests, totalRequests, quotes, wins, creditAgg, openSupportChats] =
    await Promise.all([
      db.user.count({ where: { role: "TUTOR" } }),
      db.user.count({ where: { role: "PARENT" } }),
      db.request.count({ where: { status: "OPEN" } }),
      db.request.count(),
      db.quote.count(),
      db.quote.count({ where: { status: "WON" } }),
      db.walletTransaction.aggregate({
        where: { type: "QUOTE_FEE" },
        _sum: { amount: true },
      }),
      db.supportConversation.count({ where: { status: "OPEN" } }),
    ]);

  const creditsSpent = Math.abs(creditAgg._sum.amount ?? 0);

  const stats = [
    { icon: GraduationCap, label: "Teachers", value: tutors, href: "/admin/tutors" },
    { icon: Users, label: "Families", value: parents, href: "/admin/parents" },
    {
      icon: MessageSquare,
      label: "Support Chats (Open)",
      value: openSupportChats,
      href: "/admin/support",
      highlight: openSupportChats > 0,
    },
    { icon: Inbox, label: "Open requests", value: `${openRequests} / ${totalRequests}`, href: "/admin/requests" },
    { icon: FileText, label: "Quotes sent", value: quotes },
    { icon: Trophy, label: "Jobs won", value: wins },
    { icon: Coins, label: "Credits spent on quotes", value: creditsSpent },
  ];

  const recent = await db.request.findMany({
    include: { service: true, quotes: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentChats = await db.supportConversation.findMany({
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => {
          const content = (
            <div
              className={`rounded-2xl border p-5 transition ${
                s.highlight
                  ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    s.highlight ? "bg-emerald-600 text-white" : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <s.icon size={20} />
                </span>
                {s.highlight && (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          );

          return s.href ? (
            <Link key={s.label} href={s.href} className="block group">
              {content}
            </Link>
          ) : (
            <div key={s.label}>{content}</div>
          );
        })}
      </div>

      {/* Recent Support Chats Section */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare size={19} className="text-emerald-700" /> Recent Support Chats
        </h2>
        <Link
          href="/admin/support"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          View all in Inbox →
        </Link>
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {recentChats.length === 0 ? (
          <p className="p-5 text-center text-sm text-slate-400">No support chats yet.</p>
        ) : (
          recentChats.map((c, i) => {
            const lastMsg = c.messages[0];
            return (
              <Link
                key={c.id}
                href="/admin/support"
                className={`flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition ${
                  i > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {c.userName || "Guest User"}
                    </p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {c.userRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {lastMsg ? (lastMsg.content || "").replaceAll("*", "") : "No messages"}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 ${
                    c.status === "OPEN"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {c.status}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {/* Latest Requests */}
      <h2 className="mt-10 text-lg font-bold text-slate-900">Latest requests</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {recent.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center justify-between gap-3 px-5 py-4 ${
              i > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">
                {r.service.name} — {r.parentName}
              </p>
              <p className="text-xs text-slate-500">
                {r.grade || "No level"} · {r.tutorGender || "Any"} teacher · {r.quotes.length} quote
                {r.quotes.length === 1 ? "" : "s"}
              </p>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                r.status === "OPEN"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
