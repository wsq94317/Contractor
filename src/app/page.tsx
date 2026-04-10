import Link from "next/link";

import { getHotels } from "@/lib/data";

export default async function HomePage() {
  const hotels = await getHotels();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,166,42,0.18),_transparent_28%),linear-gradient(135deg,#071a2d_0%,#0b2950_50%,#112d4f_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-white/8 p-8 shadow-[0_30px_90px_rgba(2,12,27,0.35)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#f1c24a]">
                YEHS Hotels
              </p>
              <h1 className="font-heading text-5xl leading-none sm:text-6xl">
                Contractor, Visitor and Temporary Access Log
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                Choose a hotel below to open the front-desk experience. Each property keeps its
                own records, its own staff login, and its own sign in / sign out workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-[#102a54] p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Hotels</p>
                <p className="mt-3 text-4xl font-semibold text-[#f1c24a]">4</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-[#0f3a47] p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Flow</p>
                <p className="mt-3 text-2xl font-semibold text-white">Sign In / Out</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-[#3f1d25] p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Access</p>
                <p className="mt-3 text-2xl font-semibold text-white">Hotel-scoped Admin</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {hotels.map((hotel, index) => (
            <article
              key={hotel.id}
              className="group overflow-hidden rounded-[32px] border border-white/12 bg-white/8 shadow-[0_25px_70px_rgba(2,12,27,0.3)] backdrop-blur transition hover:-translate-y-1 hover:border-[#f1c24a]/70"
            >
              <div className="relative h-56 overflow-hidden bg-[linear-gradient(140deg,#0f2350_0%,#1a315f_40%,#d4a62a_140%)] p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_80%_65%,rgba(255,255,255,0.12),transparent_25%)]" />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-100">
                    Hotel {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#f4d788]">
                      {hotel.code}
                    </p>
                    <h2 className="mt-2 font-heading text-4xl leading-none text-white">
                      {hotel.shortName}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <p className="text-sm leading-7 text-slate-200">{hotel.address}</p>
                <p className="text-sm leading-7 text-slate-300">{hotel.heroNote}</p>
                <Link
                  href={`/hotels/${hotel.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#f1c24a] bg-[#f1c24a] px-5 py-3 text-sm font-semibold text-[#0f2350] transition hover:bg-[#f8d36d]"
                >
                  Open {hotel.shortName}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
