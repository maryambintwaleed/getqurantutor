import { Download, Volume2, CheckCircle2, Clock, XCircle, AlertCircle, Edit2 } from "lucide-react";
import { db } from "@/lib/db";
import { adjustCredits, deleteUser, updateTeacherProfile } from "@/actions/admin";
import { timeAgo } from "@/lib/format";
import { formatZone } from "@/lib/geo";

export default async function AdminTutors() {
  const tutors = await db.user.findMany({
    where: { role: "TUTOR" },
    include: {
      tutorProfile: {
        include: {
          services: { include: { service: true } },
          quotes: true,
          recitation: { select: { tutorId: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Teachers</h1>
      <p className="mt-2 text-sm text-slate-400">{tutors.length} registered</p>

      <div className="mt-6 space-y-4">
        {tutors.map((t) => {
          const p = t.tutorProfile!;
          const grades: string[] = JSON.parse(p.grades || "[]");
          return (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{t.name}</p>
                    {p.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                    {p.status === "SUBMITTED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                        <Clock size={12} /> In Review
                      </span>
                    )}
                    {p.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                    {p.status === "PENDING" && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {t.email} · joined {timeAgo(t.createdAt)}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                      {p.gender || "Gender not set"}
                    </span>
                    {p.country && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                        {p.country}
                        {p.timezone ? ` (${formatZone(p.timezone)})` : ""}
                      </span>
                    )}
                    {p.ijazah && (
                      <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                        Ijazah
                      </span>
                    )}
                    {p.hafiz && (
                      <span className="rounded-lg bg-accent-50 px-2 py-0.5 font-semibold text-accent-700">
                        {p.gender === "Female" ? "Hafiza" : "Hafiz"}
                      </span>
                    )}
                    {(JSON.parse(p.languages || "[]") as string[]).map((l) => (
                      <span key={l} className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                        {l}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-slate-900">{p.balance} credits</p>
                  <p className="text-slate-500">
                    {p.quotes.length} quotes · {p.quotes.filter((quote) => quote.status === "WON").length} wins
                  </p>
                </div>
              </div>

              {p.bio && <p className="mt-3 text-sm text-slate-600">{p.bio}</p>}

              {/* Recitation Audio Player & Download */}
              {p.recitation || p.audioType || p.audioUrl ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Volume2 size={15} className="text-brand-600 shrink-0" />
                    <span>Quran Recitation:</span>
                  </div>
                  <audio
                    controls
                    preload="none"
                    src={p.audioUrl || `/admin/verification/audio/${p.id}`}
                    className="h-8 max-w-full sm:max-w-md flex-1"
                  />
                  <a
                    href={`/admin/verification/audio/${p.id}?download=1`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-brand-500 hover:text-brand-700 transition"
                  >
                    <Download size={14} /> Download Sample
                  </a>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic flex items-center gap-1">
                  <AlertCircle size={13} /> No recitation audio on file
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.services.map((ts) => (
                  <span
                    key={ts.id}
                    className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                  >
                    {ts.service.name}
                  </span>
                ))}
                {grades.map((g) => (
                  <span
                    key={g}
                    className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {g}
                  </span>
                ))}
                {p.services.length === 0 && (
                  <span className="text-xs text-slate-400">No courses selected yet</span>
                )}
              </div>

              {/* Quick Edit Details */}
              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1.5 select-none">
                  <Edit2 size={13} /> Edit Profile Details (Country, Timezone, Name, Bio)
                </summary>
                <form action={updateTeacherProfile} className="mt-3 space-y-3 pt-3 border-t border-slate-200">
                  <input type="hidden" name="tutorId" value={p.id} />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                      <input
                        name="name"
                        defaultValue={t.name}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                      <input
                        name="country"
                        defaultValue={p.country}
                        placeholder="e.g. Pakistan, United States, Egypt"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Time zone</label>
                      <input
                        name="timezone"
                        defaultValue={p.timezone}
                        placeholder="e.g. Asia/Karachi, Europe/London"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        defaultValue={p.gender || "Male"}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Verification Status</label>
                      <select
                        name="status"
                        defaultValue={p.status}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                      >
                        <option value="APPROVED">APPROVED (Verified)</option>
                        <option value="SUBMITTED">SUBMITTED (In Review)</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input type="checkbox" name="ijazah" defaultChecked={p.ijazah} className="rounded accent-brand-600" />
                        Ijazah
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input type="checkbox" name="hafiz" defaultChecked={p.hafiz} className="rounded accent-brand-600" />
                        Hafiz/Hafiza
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      defaultValue={p.bio}
                      rows={2}
                      placeholder="Teacher bio..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700">
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </details>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <form action={adjustCredits} className="flex items-center gap-2">
                  <input type="hidden" name="tutorId" value={p.id} />
                  <input
                    name="amount"
                    type="number"
                    step="1"
                    placeholder="+/- credits"
                    className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
                  />
                  <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
                    Adjust credits
                  </button>
                </form>
                <form action={deleteUser} className="ml-auto">
                  <input type="hidden" name="userId" value={t.id} />
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                    Delete teacher
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
