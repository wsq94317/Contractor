import Image from "next/image";
import Link from "next/link";

import { HotelLoginForm } from "@/components/hotel-login-form";
import { hotelBrandAssets } from "@/lib/constants";
import { getHotelBySlug } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function HotelLoginPage({ params }: PageProps) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  const brandAssets = hotelBrandAssets[hotel.slug] ?? hotelBrandAssets["sydney-qvb"];

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#071a2d_0%,#0f2350_45%,#d4a62a_160%)] px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 overflow-hidden rounded-[36px] border border-white/15 bg-white shadow-[0_28px_80px_rgba(2,12,27,0.3)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[#0f2350] p-8 text-white lg:p-10">
          <div className="relative h-24 w-[320px] max-w-full overflow-hidden rounded-2xl bg-white/6 p-2">
            <Image
              src={brandAssets.logoSrc}
              alt={brandAssets.logoAlt}
              fill
              className="object-contain p-2"
              sizes="320px"
              priority
            />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.45em] text-[#f1c24a]">{hotel.code}</p>
          <h1 className="mt-4 font-heading text-5xl leading-none">{hotel.shortName}</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-slate-200">
            Staff login opens the property-specific record table. Each hotel account only has
            access to its own visitor log.
          </p>
        </section>

        <section className="flex flex-col justify-center p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Hotel Staff</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Staff Log In</h2>
            </div>
            <Link href={`/hotels/${hotel.slug}`} className="text-sm font-semibold text-[#0f2350]">
              Back
            </Link>
          </div>

          <HotelLoginForm hotelSlug={hotel.slug} />
        </section>
      </div>
    </main>
  );
}
