import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { softDeleteRecord } from "@/actions/record-actions";
import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { recordStatusOptions, visitorTypeOptions } from "@/lib/constants";
import { getFilteredVisitRecords } from "@/lib/data";
import {
  formatDateTime,
  getRecordStatusLabel,
  getSignInTypeLabel,
  getTaskStatusLabel,
  getVisitorTypeLabel,
} from "@/lib/format";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffRecordsPage({ searchParams }: PageProps) {
  const session = await requireStaffSession();
  const canManageRecords = isSuperAdmin(session.username);
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

  const records = await getFilteredVisitRecords({
    hotelId: session.hotelId,
    q,
    status: status as RecordStatus | "ALL",
    visitorType,
    dateFrom,
    dateTo,
  });

  const openCount = records.filter((record) => record.recordStatus === RecordStatus.OPEN).length;

  return (
    <div className="space-y-8">
      <StaffAdminTabs current="records" />

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

        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
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
          <button
            type="submit"
            className="rounded-full border border-[#d4a62a] bg-[#d4a62a] px-5 py-3 text-sm font-semibold text-[#0f2350] transition hover:bg-[#f3cc5f]"
          >
            Apply
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-[28px] border border-slate-200">
          <table className="min-w-[1600px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {[
                  "Visitor",
                  "Type",
                  "Company",
                  "Contact",
                  "Visitor Type",
                  "Visitors",
                  "Sign In",
                  "Sign Out",
                  "Task Status",
                  "Key Return",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.map((record) => (
                <tr key={record.id} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">{record.visitorName}</div>
                    <div className="mt-1 text-xs text-slate-500">{record.reasonDetail}</div>
                  </td>
                  <td className="px-4 py-4">{getSignInTypeLabel(record.signInType)}</td>
                  <td className="px-4 py-4">{record.companyName}</td>
                  <td className="px-4 py-4">
                    <div>{record.contactNumber}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {record.carRegistrationNumber || "No vehicle"}
                    </div>
                  </td>
                  <td className="px-4 py-4">{getVisitorTypeLabel(record.visitorType)}</td>
                  <td className="px-4 py-4">{record.numberOfVisitors}</td>
                  <td className="px-4 py-4">{formatDateTime(record.signInAt)}</td>
                  <td className="px-4 py-4">{formatDateTime(record.signOutAt)}</td>
                  <td className="px-4 py-4">{getTaskStatusLabel(record.taskStatus)}</td>
                  <td className="px-4 py-4">{record.keyReturnTo || "Pending"}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        record.recordStatus === RecordStatus.OPEN
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {getRecordStatusLabel(record.recordStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/staff/records/${record.id}`}
                        className="text-sm font-semibold text-[#0f2350]"
                      >
                        View
                      </Link>
                      {canManageRecords ? (
                        <Link
                          href={`/staff/records/${record.id}/edit`}
                          className="text-sm font-semibold text-[#8b6914]"
                        >
                          Edit
                        </Link>
                      ) : null}
                      {canManageRecords ? (
                        <form action={softDeleteRecord.bind(null, record.id)}>
                          <button
                            type="submit"
                            className="text-left text-sm font-semibold text-rose-700"
                          >
                            Delete
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-slate-500">
                    No records match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
