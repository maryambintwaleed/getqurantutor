import { BadgeCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import LanguagePicker from "@/components/LanguagePicker";
import { updateTutorProfile } from "@/actions/tutor";
import SubmitButton from "@/components/SubmitButton";
import LocationFields from "@/components/LocationFields";
import SavedNotice from "@/components/SavedNotice";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;
  const myLanguages = new Set<string>(JSON.parse(profile.languages || "[]"));

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      <p className="mt-2 text-slate-500">
        Families choose a teacher on credentials, language and timing — fill this in properly and
        you will win far more students.
      </p>

      {saved && (
        <div className="mt-4">
          <SavedNotice message="Profile saved successfully! Your changes are live." />
        </div>
      )}

      <form action={updateTutorProfile} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">I teach as</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {["Male", "Female"].map((g) => (
              <label
                key={g}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-brand-400"
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  defaultChecked={profile.gender === g || (!profile.gender && g === "Male")}
                  className="h-4 w-4 accent-brand-600"
                />
                {g === "Male" ? "Male teacher (ustadh)" : "Female teacher (ustadha)"}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            You will only be shown requests that ask for your gender or have no preference.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-900">Credentials</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Optional — leave unchecked if neither applies
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Only tick these if they apply to you. You do <b>not</b> need an official Ijazah or full Hifdh to teach on GetQuranTutor — you can leave both unchecked.
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-brand-400">
              <input
                type="checkbox"
                name="ijazah"
                defaultChecked={profile.ijazah}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-brand-600" />
                I hold an ijazah / sanad in recitation (Optional)
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-brand-400">
              <input
                type="checkbox"
                name="hafiz"
                defaultChecked={profile.hafiz}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="flex items-center gap-1.5">
                🕌 I am a hafiz / hafiza — memorised the full Quran (Optional)
              </span>
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            If checked, badges are shown to families on your quotes. You can describe your Tajweed and 30 Juz teaching background in your bio below.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Languages I can teach in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Families filter by language, so pick every language you can teach comfortably in.
          </p>
          <LanguagePicker selected={[...myLanguages]} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Where you are</h2>
          <div className="mt-3">
            <LocationFields country={profile.country} timezone={profile.timezone} />
          </div>
          <textarea
            name="bio"
            defaultValue={profile.bio}
            rows={4}
            placeholder="Short introduction — your qualification, where you studied, experience teaching Quran with Tajweed (all 30 Juz/Paras)…"
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <SubmitButton>Save profile</SubmitButton>
          {saved && <SavedNotice message="Profile saved successfully!" />}
        </div>
      </form>
    </>
  );
}

