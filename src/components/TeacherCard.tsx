import { BadgeCheck, Award } from "lucide-react";
import RecitationPlayer from "@/components/RecitationPlayer";
import { formatZone } from "@/lib/geo";

export type TeacherCardData = {
  id: string;
  user: { name: string };
  gender: string;
  country: string;
  timezone: string;
  ijazah: boolean;
  hafiz: boolean;
  languages: string;
  bio: string;
  recitation?: { tutorId: string } | null;
  audioType?: string;
  audioUrl?: string;
  services?: { service: { name: string } }[];
};

export default function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const languages: string[] = JSON.parse(teacher.languages || "[]");
  const hasAudio = !!(teacher.recitation || teacher.audioType || teacher.audioUrl);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-base ${
                teacher.gender === "Female"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-brand-100 text-brand-700"
              }`}
            >
              {(teacher.user.name.charAt(0) || "Q").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900 leading-tight">
                  {teacher.user.name}
                </h3>
                <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {teacher.country || "Online"}
                {teacher.timezone ? ` · ${formatZone(teacher.timezone)}` : ""}
              </p>
            </div>
          </div>

          {teacher.gender && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
                teacher.gender === "Female"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {teacher.gender === "Female" ? "Sister / Female" : "Male"}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {teacher.ijazah && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800 border border-amber-200">
              <Award size={12} /> Certified Ijazah
            </span>
          )}
          {teacher.hafiz && (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700 border border-brand-200">
              {teacher.gender === "Female" ? "Hafiza" : "Hafiz"}
            </span>
          )}
          {languages.slice(0, 3).map((lang) => (
            <span key={lang} className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
              {lang}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3 min-h-[2.5rem]">
          {teacher.bio || "Certified Quran & Tajweed teacher dedicated to helping students learn with proper pronunciation, patience, and care."}
        </p>

        {/* Courses */}
        {teacher.services && teacher.services.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {teacher.services.map((ts, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {ts.service.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Audio Recitation Player - without Book Free Trial */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {hasAudio ? (
          <RecitationPlayer
            tutorId={teacher.id}
            audioUrl={teacher.audioUrl || undefined}
            tutorName={teacher.user.name}
          />
        ) : (
          <div className="rounded-xl bg-slate-50 p-2.5 text-center text-xs text-slate-400">
            Recitation sample available on quote
          </div>
        )}
      </div>
    </div>
  );
}
