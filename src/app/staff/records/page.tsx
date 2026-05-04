import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { RecordManagementPanel } from "@/components/record-management-panel";
import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { recordStatusOptions, visitorTypeOptions } from "@/lib/constants";
import {
  getFilteredVisitRecords,
  getVisitorNamesForHotel,
  type RecordSort,
} from "@/lib/data";
import {
  formatDateTime,
  getDurationHours,
  getDurationHoursValue,
} from "@/lib/format";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const recordSortOptions: Array<{ value: RecordSort; label: string }> = [
  { value: "SIGN_IN_DESC", label: "Sign In: Newest first" },
  { value: "SIGN_IN_ASC", label: "Sign In: Oldest first" },
  { value: "SIGN_OUT_DESC", label: "Sign Out: Newest first" },
  { value: "SIGN_OUT_ASC", label: "Sign Out: Oldest first" },
  { value: "NAME_ASC", label: "Name: A to Z" },
  { value: "NAME_DESC", label: "Name: Z to A" },
];

export default async function StaffRecordsPage({ searchParams }: PageProps) {
  const session = await requireStaffSession();
  const canManageRecords = isSuperAdmin(session.username);
  const canViewAttendance = isSuperAdmin(session.username);
  const resolvedSearchParams = await searchParams;

  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const status =
    typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "ALL";
  const visitorType =
    typeof resolvedSearchParams.visitorType === "string"
      ? resolvedSearchParams.visitorType
      : "ALL";
  const dateFrom =
    typeof resolvedSearchParams.dateFrom === "string" ? resolvedSearchParams.dateFrom : "";
  const dateTo = typeof resolvedSearchParams.dateTo === "string" ? resolvedSearchParams.dateTo : "";
  const sort =
    typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "SIGN_IN_DESC";
  const visitorNames = Array.isArray(resolvedSearchParams.visitorName)
    ? resolvedSearchParams.visitorName.filter((value): value is string => typeof value === "string")
    : typeof resolvedSearchParams.visitorName === "string"
      ? [resolvedSearchParams.visitorName]
      : [];

  const [records, availableVisitorNames] = await Promise.all([
    getFilteredVisitRecords({
      hotelId: session.hotelId,
      q,
      status: status as RecordStatus | "ALL",
      visitorType,
      visitorNames,
      dateFrom,
      dateTo,
      sort: sort as RecordSort,
    }),
    getVisitorNamesForHotel(session.hotelId),
  ]);

  const openCount = records.filter((record) => record.recordStatus === RecordStatus.OPEN).length;

  return (
    <div className="space-y-8">
      <StaffAdminTabs current="records" canViewAttendance={canViewAttendance} />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Visible Records</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{records.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Open Records</p>
          <p className="mt-4 text-4xl font-semibold text-[#8b6914]">{openCount}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Hotel Scope</p>
          <p className="mt-4 text-2xl font-semibold text-slate-950">{session.hotelShortName}</p>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Admin</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Record management</h2>
          </div>
          <Link
            href="/staff/records/new"
            className="inline-flex items-center justify-center rounded-full border border-[#0f2350] bg-[#0f2350] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17346f]"
          >
            Create manual record
          </Link>
        </div>

        <form className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.2fr_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search visitor, company, phone, visit reason"
              className="form-input"
            />
            <select name="status" defaultValue={status} className="form-input">
              <option value="ALL">All statuses</option>
              {recordStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select name="visitorType" defaultValue={visitorType} className="form-input">
              <option value="ALL">All visitor types</option>
              {visitorTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input type="date" name="dateFrom" defaultValue={dateFrom} className="form-input" />
            <input type="date" name="dateTo" defaultValue={dateTo} className="form-input" />
            <select name="sort" defaultValue={sort} className="form-input">
              {recordSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full border border-[#d4a62a] bg-[#d4a62a] px-5 py-3 text-sm font-semibold text-[#0f2350] transition hover:bg-[#f3cc5f]"
            >
              Apply
            </button>
          </div>

          <details className="rounded-[24px] border border-slate-200 bg-white">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[#0f2350] marker:hidden">
              Filter by visitor name
              {visitorNames.length ? ` (${visitorNames.length} selected)` : ""}
            </summary>
            <div className="border-t border-slate-200 px-5 py-4">
              <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                {availableVisitorNames.map((name) => (
                  <label key={name} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="visitorName"
                      value={name}
                      defaultChecked={visitorNames.includes(name)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0f2350] focus:ring-[#0f2350]"
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </form>

        <RecordManagementPanel
          canManageRecords={canManageRecords}
          records={records.map((record) => ({
            id: record.id,
            signInType: record.signInType,
            visitorName: record.visitorName,
            companyName: record.companyName,
            contactNumber: record.contactNumber,
            carRegistrationNumber: record.carRegistrationNumber,
            visitorType: record.visitorType,
            numberOfVisitors: record.numberOfVisitors,
            reasonDetail: record.reasonDetail,
            contractorSet: record.contractorSet,
            additionalKey: record.additionalKey,
            recordStatus: record.recordStatus,
            taskStatus: record.taskStatus,
            keyReturnTo: record.keyReturnTo,
            signOutNote: record.signOutNote,
            signInLabel: formatDateTime(record.signInAt),
            signOutLabel: formatDateTime(record.signOutAt),
            hoursLabel: getDurationHours(record.signInAt, record.signOutAt),
            hoursValue: getDurationHoursValue(record.signInAt, record.signOutAt),
            canSettle: Boolean(record.signOutAt),
          }))}
        />
      </section>
    </div>
  );
}
