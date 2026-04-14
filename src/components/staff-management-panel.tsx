"use client";

import { useMemo, useState } from "react";

import { deleteStaffProfile } from "@/actions/staff-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { StaffProfileForm } from "@/components/staff-profile-form";

type StaffManagementPanelProps = {
  canDelete: boolean;
  hotels: Array<{
    id: string;
    code: string;
    shortName: string;
  }>;
  staffProfiles: Array<{
    id: string;
    name: string;
    phone: string;
    position: string;
    companyName: string;
    carRegistrationNumber: string | null;
    hotelIds: string[];
    hotelNames: string[];
  }>;
};

export function StaffManagementPanel({
  canDelete,
  hotels,
  staffProfiles,
}: StaffManagementPanelProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedStaffProfile = useMemo(
    () => staffProfiles.find((staffProfile) => staffProfile.id === selectedStaffId),
    [selectedStaffId, staffProfiles],
  );

  function openCreateModal() {
    setSelectedStaffId(null);
    setIsModalOpen(true);
  }

  function openEditModal(staffProfileId: string) {
    setSelectedStaffId(staffProfileId);
    setIsModalOpen(true);
  }

  function closeModal() {
    setSelectedStaffId(null);
    setIsModalOpen(false);
  }

  return (
    <>
      <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Directory</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Configured Staff</h2>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-full border border-[#0f2350] bg-[#0f2350] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17346f]"
          >
            Add Staff
          </button>
        </div>

        <div className="overflow-x-auto rounded-[28px] border border-slate-200">
          <table className="min-w-[960px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {["Name", "Phone", "Position", "Company", "Car Rego", "Hotels", "Actions"].map((heading) => (
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
                  <td className="px-4 py-4">{staffProfile.companyName}</td>
                  <td className="px-4 py-4">{staffProfile.carRegistrationNumber || "Not provided"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {staffProfile.hotelNames.map((hotelName) => (
                        <span
                          key={hotelName}
                          className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {hotelName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(staffProfile.id)}
                        className="text-left text-sm font-semibold text-[#0f2350]"
                      >
                        Edit
                      </button>
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No staff have been configured yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.3)] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Admin</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                  {selectedStaffProfile ? "Edit Staff" : "Add Staff"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <StaffProfileForm hotels={hotels} staffProfile={selectedStaffProfile ?? undefined} />
          </div>
        </div>
      ) : null}
    </>
  );
}
