import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALL_GRADES } from "@/lib/services";
import { updateTutorGrades } from "@/actions/tutor";
import SubmitButton from "@/components/SubmitButton";
import SavedNotice from "@/components/SavedNotice";
import ServiceToggle from "@/components/ServiceToggle";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;

  const [services, mine] = await Promise.all([
    db.service.findMany({ where: { active: true } }),
    db.tutorService.findMany({ where: { tutorId: profile.id } }),
  ]);
  const mineSet = new Set(mine.map((ts) => ts.serviceId));
  const myGrades = new Set<string>(JSON.parse(profile.grades || "[]"));

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Courses</h1>
      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-500">
        Turn on the courses you teach — you&apos;ll see family requests for those courses in your
        Opportunities.
      </p>

      <div className="mt-5 sm:mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {services.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center justify-between gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 ${
              i > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 text-sm sm:text-base">
                {s.emoji} {s.name}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{s.description}</p>
            </div>
            <ServiceToggle serviceId={s.id} enabled={mineSet.has(s.id)} />
          </div>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="font-bold text-slate-900 text-base sm:text-lg">Student levels I accept</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          You&apos;ll only see opportunities at the levels you select — from complete beginners to
          hifdh revision. Leave all unchecked to see every level.
        </p>
        <form action={updateTutorGrades} className="mt-4">
          <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_GRADES.map((grade) => (
              <label
                key={grade}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:border-brand-400"
              >
                <input
                  type="checkbox"
                  name="grades"
                  value={grade}
                  defaultChecked={myGrades.has(grade)}
                  className="h-4 w-4 accent-brand-600 rounded shrink-0"
                />
                <span className="truncate">{grade}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <SubmitButton className="w-full sm:w-auto rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 text-center">
              Save levels
            </SubmitButton>
            {saved && <SavedNotice message="Levels saved" />}
          </div>
        </form>
      </div>
    </>
  );
}
