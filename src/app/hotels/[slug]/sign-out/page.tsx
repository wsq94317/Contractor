import Image from "next/image";
import Link from "next/link";

import { SignOutForm } from "@/components/sign-out-form";
import { hotelBrandAssets } from "@/lib/constants";
import { getHotelBySlug, getOpenVisitRecordsByHotel } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HotelSignOutPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  const brandAssets = hotelBrandAssets[hotel.slug] ?? hotelBrandAssets["sydney-qvb"];
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams.success === "1";
  const openRecords = await getOpenVisitRecordsByHotel(hotel.id);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-[28px] bg-[#0f2350] px-6 py-5 text-white shadow-[0_22px_60px_rgba(15,35,80,0.22)]">
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
          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-[#f1c24a]">{hotel.code}</p>
          <h1 className="mt-2 font-heading text-4xl">{hotel.name}</h1>
          <p className="mt-3 text-sm text-slate-200">
            Complete the sign out, capture both signatures, and close the access record.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Link href={`/hotels/${hotel.slug}`} className="text-sm font-semibold text-[#0f2350]">
            ← Back to hotel home
          </Link>
          <Link href={`/hotels/${hotel.slug}/sign-in`} className="text-sm font-semibold text-[#0f2350]">
            Go to sign in
          </Link>
        </div>

        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Sign out record saved successfully.
          </div>
        ) : null}

        {openRecords.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
            No active sign in records are available for sign out.
          </div>
        ) : (
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-8">
            <SignOutForm hotelSlug={hotel.slug} openRecords={openRecords} />
          </section>
        )}
      </div>
    </main>
  );
}
