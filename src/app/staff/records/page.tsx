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

        {records.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            No records match the current filters.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="hidden rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 xl:grid xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto] xl:gap-4">
              <span>Visitor</span>
              <span>Company</span>
              <span>Visitor Type</span>
              <span>In / Out</span>
              <span>Actions</span>
            </div>

            {records.map((record) => (
              <article
                key={record.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              >
                <div className="flex flex-col gap-4 px-5 py-5 xl:grid xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto] xl:items-center xl:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-950">{record.visitorName}</p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          record.recordStatus === RecordStatus.OPEN
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {getRecordStatusLabel(record.recordStatus)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{record.contactNumber}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{record.reasonDetail}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{record.companyName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Car: {record.carRegistrationNumber || "No vehicle"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {getVisitorTypeLabel(record.visitorType)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Visitors: {record.numberOfVisitors}
                    </p>
                  </div>

                  <div className="min-w-0 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">In:</span>{" "}
                      {formatDateTime(record.signInAt)}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-slate-900">Out:</span>{" "}
                      {formatDateTime(record.signOutAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <Link
                      href={`/staff/records/${record.id}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0f2350] transition hover:border-[#0f2350] hover:bg-slate-50"
                    >
                      View
                    </Link>
                    {canManageRecords ? (
                      <Link
                        href={`/staff/records/${record.id}/edit`}
                        className="rounded-full border border-[#d4a62a] px-4 py-2 text-sm font-semibold text-[#8b6914] transition hover:bg-[#fff8df]"
                      >
                        Edit
                      </Link>
                    ) : null}
                    {canManageRecords ? (
                      <form action={softDeleteRecord.bind(null, record.id)}>
                        <button
                          type="submit"
                          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                <details className="border-t border-slate-200 bg-slate-50/70">
                  <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[#0f2350] marker:hidden">
                    Expand details
                  </summary>
                  <div className="grid gap-4 px-5 pb-5 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Task Status", getTaskStatusLabel(record.taskStatus)],
                      ["Key Return", record.keyReturnTo || "Pending"],
                      ["Key Set", record.contractorSet || "Not provided"],
                      ["Additional Key", record.additionalKey || "Not provided"],
                      ["Sign Out Note", record.signOutNote || "No note"],
                      ["Sign In Type", getSignInTypeLabel(record.signInType)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[20px] border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
