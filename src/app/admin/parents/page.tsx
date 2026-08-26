import { db } from "@/lib/db";
import { deleteUser } from "@/actions/admin";
import { timeAgo } from "@/lib/format";

export default async function AdminParents() {
  const parents = await db.user.findMany({
    where: { role: "PARENT" },
    include: { requests: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Families</h1>
      <p className="mt-2 text-sm text-slate-400">
        {parents.length} registered (guest requests do not create accounts)
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {parents.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No registered families yet.
          </p>
        )}
        {parents.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-3 px-5 py-4 ${
              i > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div>
              <p className="font-semibold text-slate-900">{p.name}</p>
              <p className="text-sm text-slate-500">
                {p.email} · joined {timeAgo(p.createdAt)} · {p.requests.length} request
                {p.requests.length === 1 ? "" : "s"}
              </p>
            </div>
            <form action={deleteUser}>
              <input type="hidden" name="userId" value={p.id} />
              <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
