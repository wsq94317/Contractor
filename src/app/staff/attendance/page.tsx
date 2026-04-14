import Link from "next/link";

import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { requireStaffSession } from "@/lib/auth";
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
                className="overflow-x-auto rounded-[28px] border border-slate-200"
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

                <table className="min-w-[1200px] divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-white text-slate-700">
                    <tr>
                      {[
                        "Date",
                        "Task",
                        "Key Set",
                        "Additional Key",
                        "Sign In",
                        "Sign Out",
                        "Hours",
                        "Status",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {group.records.map((record) => (
                      <tr key={record.id} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-4">
                          {new Intl.DateTimeFormat("en-AU", {
                            dateStyle: "medium",
                          }).format(record.signInAt)}
                        </td>
                        <td className="px-4 py-4">{record.reasonDetail}</td>
                        <td className="px-4 py-4">{record.contractorSet || "Not provided"}</td>
                        <td className="px-4 py-4">{record.additionalKey || "Not provided"}</td>
                        <td className="px-4 py-4">{formatDateTime(record.signInAt)}</td>
                        <td className="px-4 py-4">{formatDateTime(record.signOutAt)}</td>
                        <td className="px-4 py-4">
                          {getDurationHours(record.signInAt, record.signOutAt) || "Open"}
                        </td>
                        <td className="px-4 py-4">{getRecordStatusLabel(record.recordStatus)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-4 text-right font-semibold text-slate-700">
                        Total Hours
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#0f2350]">
                        {group.totalHours.toFixed(2)}
                      </td>
                      <td className="px-4 py-4" />
                    </tr>
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
