import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-6 py-10">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Not Found</p>
        <h1 className="mt-4 font-heading text-5xl text-slate-950">Page not found</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          The hotel, record, or page you requested does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-[#0f2350] bg-[#0f2350] px-5 py-3 text-sm font-semibold text-white"
        >
          Return to home
        </Link>
      </div>
    </main>
  );
}
