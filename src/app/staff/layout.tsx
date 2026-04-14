import Link from "next/link";

import { logoutStaff } from "@/actions/auth-actions";
import { requireStaffSession } from "@/lib/auth";

export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireStaffSession();

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">{session.hotelCode}</p>
            <h1 className="font-heading text-4xl text-slate-950">{session.hotelName}</h1>
            <p className="text-sm text-slate-600">
              Logged in as {session.name} ({session.username})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/staff/records/new"
              className="rounded-full border border-[#0f2350] bg-[#0f2350] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17346f]"
            >
              New Record
            </Link>
            <form action={logoutStaff}>
              <button
                type="submit"
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
