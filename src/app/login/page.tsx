import SiteHeader from "@/components/SiteHeader";
import { LoginForm } from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Log in to your GetTutor account.</p>
          <LoginForm next={next} />
        </div>
      </main>
    </>
  );
}
