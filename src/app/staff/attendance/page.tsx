import Link from "next/link";

import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { groupStaffAttendanceRecords } from "@/lib/attendance";
import { getStaffAttendanceRecords } from "@/lib/data";
import {
  formatDateTime,
  getDurationHours,
  getDurationHoursValue,
  getRecordStatusLabel,
} from "@/lib/format";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffAttendancePage({ searchParams }: PageProps) {
  const session = await requireStaffSession();
  const canManageRecords = isSuperAdmin(session.username);
  const resolvedSearchParams = await searchParams;

  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const dateFrom =
    typeof resolvedSearchParams.dateFrom === "string" ? resolvedSearchParams.dateFrom : "";
  const dateTo = typeof resolvedSearchParams.dateTo === "string" ? resolvedSearchParams.dateTo : "";

  const records = await getStaffAttendanceRecords({
    hotelId: session.hotelId,
    q,
    dateFrom,
    dateTo,
  });
  const groupedRecords = groupStaffAttendanceRecords(records);

  const openCount = records.filter((record) => !record.signOutAt).length;
  const totalHours = records.reduce(
    (total, record) => total + getDurationHoursValue(record.signInAt, record.signOutAt),
    0,
  );

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (dateFrom) exportParams.set("dateFrom", dateFrom);
  if (dateTo) exportParams.set("dateTo", dateTo);

  return (
    <div className="space-y-8">
      <StaffAdminTabs current="attendance" />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Attendance Records</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{records.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Open Attendance</p>
          <p className="mt-4 text-4xl font-semibold text-[#8b6914]">{openCount}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Closed Hours</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{totalHours.toFixed(2)}</p>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Admin</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Staff Attendance</h2>
          </div>
          <Link
            href={`/staff/attendance/export?${exportParams.toString()}`}
            className="inline-flex items-center justify-center rounded-full border border-[#0f2350] bg-[#0f2350] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17346f]"
          >
            Export CSV
          </Link>
        </div>

        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search staff name, phone, position, task"
            className="form-input"
          />
          <input type="date" name="dateFrom" defaultValue={dateFrom} className="form-input" />
          <input type="date" name="dateTo" defaultValue={dateTo} className="form-input" />
          <button
            type="submit"
            className="rounded-full border border-[#d4a62a] bg-[#d4a62a] px-5 py-3 text-sm font-semibold text-[#0f2350] transition hover:bg-[#f3cc5f]"
          >
            Apply
          </button>
        </form>

        {groupedRecords.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            No staff attendance records match the current filters.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {groupedRecords.map((group) => (
              <section
                key={group.groupKey}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
              >
                <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Staff</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{group.staffName}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {group.phone}
                      {group.position ? ` | ${group.position}` : ""}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-[#0f2350]">
                    Total Hours: {group.totalHours.toFixed(2)}
                  </div>
                </div>

                <div className="hidden border-b border-slate-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_0.65fr_0.8fr_auto] xl:gap-4">
                  <span>Date</span>
                  <span>Task</span>
                  <span>In / Out</span>
                  <span>Hours</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.records.map((record) => (
                    <article
                      key={record.id}
                      className="flex flex-col gap-4 px-5 py-5 hover:bg-slate-50 xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_0.65fr_0.8fr_auto] xl:items-center xl:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {new Intl.DateTimeFormat("en-AU", {
                            dateStyle: "medium",
                          }).format(record.signInAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{record.companyName}</p>
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{record.reasonDetail}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Key Set: {record.contractorSet || "Not provided"}
                          {" | "}
                          Additional Key: {record.additionalKey || "Not provided"}
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

                      <div className="font-semibold text-[#0f2350]">
                        {getDurationHours(record.signInAt, record.signOutAt) || "Open"}
                      </div>

                      <div className="text-sm font-semibold text-slate-700">
                        {getRecordStatusLabel(record.recordStatus)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link
                          href={`/staff/records/${record.id}`}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0f2350] transition hover:border-[#0f2350] hover:bg-white"
                        >
                          View Detail
                        </Link>
                        {canManageRecords ? (
                          <Link
                            href={`/staff/records/${record.id}/edit`}
                            className="rounded-full border border-[#d4a62a] px-4 py-2 text-sm font-semibold text-[#8b6914] transition hover:bg-[#fff8df]"
                          >
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}

                  <div className="flex items-center justify-between gap-4 bg-slate-50 px-5 py-4">
                    <p className="font-semibold text-slate-700">Total Hours</p>
                    <p className="font-semibold text-[#0f2350]">{group.totalHours.toFixed(2)}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
