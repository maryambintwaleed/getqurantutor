import SiteHeader from "@/components/SiteHeader";
import { RegisterForm } from "@/components/AuthForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Parents get quotes for free. Tutors get new students.
          </p>
          <RegisterForm initialRole={role === "TUTOR" ? "TUTOR" : "PARENT"} />
        </div>
      </main>
    </>
  );
}
