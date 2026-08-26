import CategoryForm from "@/components/CategoryForm";

export default function NewCategory() {
  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">New category</h1>
      <p className="mt-2 text-sm text-slate-500">
        New categories use a standard question set in the parent wizard (age, grade, frequency,
        format, start date).
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <CategoryForm />
      </div>
    </>
  );
}
