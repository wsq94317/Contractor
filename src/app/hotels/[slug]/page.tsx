import Image from "next/image";
import Link from "next/link";

import { hotelBrandAssets } from "@/lib/constants";
import { getHotelBySlug } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HotelHomePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const hotel = await getHotelBySlug(slug);
  const brandAssets = hotelBrandAssets[hotel.slug] ?? hotelBrandAssets["sydney-qvb"];
  const signedIn = resolvedSearchParams.signedIn === "1";
  const signedOut = resolvedSearchParams.signedOut === "1";

  return (
    <main className="min-h-screen bg-[#0a3154] px-6 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[#d4a62a] bg-[#1d2552] px-6 py-4 shadow-[0_24px_60px_rgba(2,12,27,0.3)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-[280px] max-w-full overflow-hidden rounded-2xl bg-white/6 p-2">
              <Image
                src={brandAssets.logoSrc}
                alt={brandAssets.logoAlt}
                fill
                className="object-contain p-2"
                sizes="280px"
                priority
              />
            </div>
            <div className="hidden md:block">
              <p className="text-xs uppercase tracking-[0.4em] text-[#f1c24a]">{hotel.code}</p>
              <h1 className="font-heading text-3xl">{hotel.name}</h1>
            </div>
          </div>

          <Link
            href={`/hotels/${hotel.slug}/login`}
            className="rounded-full border border-[#d4a62a] px-4 py-2 text-sm font-semibold text-[#f1c24a] transition hover:bg-[#d4a62a] hover:text-[#0f2350]"
          >
            Staff Log In
          </Link>
        </div>

        {signedIn ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Sign in record saved successfully.
          </div>
        ) : null}

        {signedOut ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Sign out record saved successfully.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[32px] border border-[#d4a62a]/60 bg-[#1d2552] shadow-[0_28px_70px_rgba(2,12,27,0.35)]">
          <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden border-b border-[#d4a62a]/30 bg-[radial-gradient(circle_at_top_left,_rgba(212,166,42,0.18),_transparent_25%),linear-gradient(160deg,#10244e_0%,#0f2350_58%,#14213d_100%)] p-4 sm:min-h-[560px] sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(7,10,23,0.18)_100%)]" />
            <div className="relative h-full min-h-[520px] w-full">
              <Image
                src={brandAssets.bannerSrc}
                alt={brandAssets.bannerAlt}
                fill
                priority
                className="object-contain object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.4em] text-[#f1c24a]">Building Access</p>
              <h2 className="font-heading text-5xl leading-none">{hotel.heroTitle}</h2>
              <p className="max-w-3xl text-lg leading-8 text-slate-100">
                Contractor, visitor, and temporary access log for authorised building access
                using issued keys.
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-[26px] border border-[#d4a62a]/70 bg-[#12203f] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f1c24a]">
                  Site Note
                </p>
                <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-100">
                  {hotel.heroNote}
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  href={`/hotels/${hotel.slug}/sign-in`}
                  className="block rounded-full border border-[#d4a62a] px-6 py-4 text-center text-2xl font-semibold text-[#f1c24a] transition hover:bg-[#d4a62a] hover:text-[#0f2350]"
                >
                  Sign In
                </Link>
                <Link
                  href={`/hotels/${hotel.slug}/sign-out`}
                  className="block rounded-full border border-[#d4a62a] px-6 py-4 text-center text-2xl font-semibold text-[#f1c24a] transition hover:bg-[#d4a62a] hover:text-[#0f2350]"
                >
                  Sign Out
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-200">
                <span>{hotel.address}</span>
                {hotel.phone ? <span>{hotel.phone}</span> : null}
                {hotel.email ? <span>{hotel.email}</span> : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
