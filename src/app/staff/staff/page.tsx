import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { StaffManagementPanel } from "@/components/staff-management-panel";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { getHotels, getStaffProfiles } from "@/lib/data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffManagementPage({ searchParams }: PageProps) {
  const session = await requireStaffSession();
  const canDelete = isSuperAdmin(session.username);
  const resolvedSearchParams = await searchParams;
  const isCreated = resolvedSearchParams.created === "1";
  const isUpdated = resolvedSearchParams.updated === "1";
  const isDeleted = resolvedSearchParams.deleted === "1";

  const [hotels, staffProfiles] = await Promise.all([
    getHotels(),
    getStaffProfiles(),
  ]);

  return (
    <div className="space-y-8">
      <StaffAdminTabs current="staff" />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Configured Staff</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{staffProfiles.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Accessible Hotels</p>
          <p className="mt-4 text-4xl font-semibold text-[#8b6914]">{hotels.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Current Backend</p>
          <p className="mt-4 text-2xl font-semibold text-slate-950">{session.hotelShortName}</p>
        </div>
      </section>

      {isCreated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Staff member created successfully.
        </div>
      ) : null}
      {isUpdated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Staff member updated successfully.
        </div>
      ) : null}
      {isDeleted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Staff member deleted successfully.
        </div>
      ) : null}

      <StaffManagementPanel
        canDelete={canDelete}
        hotels={hotels.map((hotel) => ({
          id: hotel.id,
          code: hotel.code,
          shortName: hotel.shortName,
        }))}
        staffProfiles={staffProfiles.map((staffProfile) => ({
          id: staffProfile.id,
          name: staffProfile.name,
          phone: staffProfile.phone,
          position: staffProfile.position,
          hotelIds: staffProfile.hotels.map((assignment) => assignment.hotelId),
          hotelNames: staffProfile.hotels.map((assignment) => assignment.hotel.shortName),
        }))}
      />
    </div>
  );
}
