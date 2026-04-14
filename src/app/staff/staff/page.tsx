import Link from "next/link";

import { deleteStaffProfile } from "@/actions/staff-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { StaffProfileForm } from "@/components/staff-profile-form";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { getHotels, getStaffProfileById, getStaffProfiles } from "@/lib/data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffManagementPage({ searchParams }: PageProps) {
  const session = await requireStaffSession();
  const canDelete = isSuperAdmin(session.username);
  const resolvedSearchParams = await searchParams;
  const editStaffId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const isCreated = resolvedSearchParams.created === "1";
  const isUpdated = resolvedSearchParams.updated === "1";
  const isDeleted = resolvedSearchParams.deleted === "1";

  const [hotels, staffProfiles, selectedStaffProfile] = await Promise.all([
    getHotels(),
    getStaffProfiles(),
    editStaffId ? getStaffProfileById(editStaffId) : Promise.resolve(null),
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

      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Admin</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Staff Management</h2>
            </div>
            {selectedStaffProfile ? (
              <Link href="/staff/staff" className="text-sm font-semibold text-[#0f2350]">
                New Staff
              </Link>
            ) : null}
          </div>

          <StaffProfileForm
            hotels={hotels.map((hotel) => ({
              id: hotel.id,
              code: hotel.code,
              shortName: hotel.shortName,
            }))}
            staffProfile={
              selectedStaffProfile
                ? {
                    id: selectedStaffProfile.id,
                    name: selectedStaffProfile.name,
                    phone: selectedStaffProfile.phone,
                    position: selectedStaffProfile.position,
                    hotelIds: selectedStaffProfile.hotels.map((assignment) => assignment.hotelId),
                  }
                : undefined
            }
          />
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Directory</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Configured Staff</h2>
          </div>

          <div className="overflow-x-auto rounded-[28px] border border-slate-200">
            <table className="min-w-[960px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  {["Name", "Phone", "Position", "Hotels", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {staffProfiles.map((staffProfile) => (
                  <tr key={staffProfile.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-950">{staffProfile.name}</td>
                    <td className="px-4 py-4">{staffProfile.phone}</td>
                    <td className="px-4 py-4">{staffProfile.position}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {staffProfile.hotels.map((assignment) => (
                          <span
                            key={assignment.hotelId}
                            className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {assignment.hotel.shortName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/staff/staff?edit=${staffProfile.id}`}
                          className="text-sm font-semibold text-[#0f2350]"
                        >
                          Edit
                        </Link>
                        {canDelete ? (
                          <form action={deleteStaffProfile.bind(null, staffProfile.id)}>
                            <ConfirmSubmitButton
                              label="Delete"
                              confirmMessage={`Delete ${staffProfile.name}? This cannot be undone.`}
                              className="text-left text-sm font-semibold text-rose-700"
                            />
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {staffProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No staff have been configured yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
