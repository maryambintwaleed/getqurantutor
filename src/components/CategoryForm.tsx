"use client";

import { useActionState } from "react";
import { saveCategory, type CategoryState } from "@/actions/admin";
import { ALL_GRADES } from "@/lib/services";

export type CategoryValues = {
  id?: string;
  name: string;
  emoji: string;
  description: string;
  grades: string[];
};

export default function CategoryForm({ initial }: { initial?: CategoryValues }) {
  const [state, action, pending] = useActionState<CategoryState, FormData>(saveCategory, {});

  return (
    <form action={action} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid grid-cols-4 gap-3">
        <input
          name="emoji"
          defaultValue={initial?.emoji ?? ""}
          placeholder="📚"
          maxLength={4}
          className="rounded-xl border border-slate-200 px-4 py-3 text-center text-xl outline-none focus:border-brand-500"
        />
        <input
          name="name"
          defaultValue={initial?.name ?? ""}
          required
          placeholder="Category name *"
          className="col-span-3 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
        />
      </div>
      <textarea
        name="description"
        defaultValue={initial?.description ?? ""}
        rows={2}
        placeholder="Short description shown to parents"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
      />
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Student levels offered</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALL_GRADES.map((grade) => (
            <label
              key={grade}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:border-brand-400"
            >
              <input
                type="checkbox"
                name="grades"
                value={grade}
                defaultChecked={initial?.grades.includes(grade) ?? false}
                className="h-4 w-4 accent-brand-600"
              />
              {grade}
            </label>
          ))}
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save category"}
      </button>
    </form>
  );
}
