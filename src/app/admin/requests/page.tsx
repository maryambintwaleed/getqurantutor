import { db } from "@/lib/db";
import { closeRequest, deleteRequest } from "@/actions/admin";
import { timeAgo } from "@/lib/format";

export default async function AdminRequests() {
  const requests = await db.request.findMany({
    include: { service: true, quotes: { include: { tutor: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Requests</h1>
      <p className="mt-2 text-sm text-slate-400">{requests.length} total</p>

      <div className="mt-6 space-y-3">
        {requests.map((r) => {
          const reqMode = r.mode === "Offline" ? "Offline" : "Online";
          return (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">
                      {r.service.name} — {r.parentName}
                    </p>
                    {r.isSchool && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                        🏫 School Hiring
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        reqMode === "Offline"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          reqMode === "Offline" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                      {reqMode}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {r.grade || "No level"} · {r.tutorGender ? `${r.tutorGender} teacher` : "Any teacher"}
                    {r.city ? ` · ${r.city}` : ""} · {timeAgo(r.createdAt)}
                    {r.urgent && <span className="ml-2 font-semibold text-red-600">Urgent</span>}
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
              {r.details && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{r.details}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-sm">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
                  <span>
                    {r.quotes.length} quote{r.quotes.length === 1 ? "" : "s"}
                    {r.quotes.length > 0 ? ":" : ""}
                  </span>
                  {r.quotes.map((quote) => {
                    const qMode = quote.mode === "Offline" ? "Offline" : "Online";
                    return (
                      <span
                        key={quote.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        <span>
                          {quote.tutor.user.name} (${quote.price})
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            qMode === "Offline"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              qMode === "Offline" ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {qMode}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <div className="ml-auto flex gap-2">
                  {r.status === "OPEN" && (
                    <form action={closeRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700">
                        Close
                      </button>
                    </form>
                  )}
                  <form action={deleteRequest}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
