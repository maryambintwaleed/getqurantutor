import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { RegisterForm } from "@/components/AuthForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const { role, next } = await searchParams;
  const isFromRequest = next?.startsWith("/request");
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 p-8 shadow-sm">
          {isFromRequest && (
            <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">
              Please create a free account (or log in) to submit a request and receive teacher quotes.
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Families get quotes for free. Teachers get new students.
          </p>
          <RegisterForm initialRole={role === "TUTOR" ? "TUTOR" : "PARENT"} next={next} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
