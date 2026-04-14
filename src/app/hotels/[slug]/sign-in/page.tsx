import Image from "next/image";
import Link from "next/link";

import { SignInForm } from "@/components/sign-in-form";
import { hotelBrandAssets } from "@/lib/constants";
import { getHotelBySlug, getStaffProfilesForHotel } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HotelSignInPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  const staffOptions = await getStaffProfilesForHotel(hotel.id);
  const brandAssets = hotelBrandAssets[hotel.slug] ?? hotelBrandAssets["sydney-qvb"];
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams.success === "1";

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-[28px] bg-[#0f2350] px-6 py-6 text-white shadow-[0_22px_60px_rgba(15,35,80,0.22)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
            <div className="relative h-20 w-[280px] shrink-0 max-w-full overflow-hidden rounded-2xl bg-white/6 p-2">
              <Image
                src={brandAssets.logoSrc}
                alt={brandAssets.logoAlt}
                fill
                className="object-contain p-2"
                sizes="280px"
                priority
              />
            </div>
            <div className="space-y-3 md:min-w-0">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f1c24a]">Sign In Page</p>
              <h1 className="font-heading text-4xl md:text-[3.2rem] md:leading-none">
                {hotel.shortName} Sign In
              </h1>
              <p className="text-sm text-slate-200">
                Switch between contractor and staff sign in for authorised building access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/hotels/${hotel.slug}`} className="text-sm font-semibold text-[#0f2350]">
            ← Back to hotel home
          </Link>
          <Link href={`/hotels/${hotel.slug}/sign-out`} className="text-sm font-semibold text-[#0f2350]">
            Go to sign out
          </Link>
        </div>

        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Sign in record saved successfully.
          </div>
        ) : null}

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <SignInForm hotelSlug={hotel.slug} staffOptions={staffOptions} />
        </section>
      </div>
    </main>
  );
}
