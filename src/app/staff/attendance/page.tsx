import Link from "next/link";

import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { requireStaffSession } from "@/lib/auth";
import { getStaffAttendanceRecords } from "@/lib/data";
import { formatDateTime, getDurationHours, getRecordStatusLabel } from "@/lib/format";

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

  const openCount = records.filter((record) => !record.signOutAt).length;
  const totalHours = records.reduce((total, record) => {
    const hours = Number(getDurationHours(record.signInAt, record.signOutAt) || 0);
    return total + hours;
  }, 0);

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

        <div className="mt-6 overflow-x-auto rounded-[28px] border border-slate-200">
          <table className="min-w-[1400px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {[
                  "Staff",
                  "Phone",
                  "Position",
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
              {records.map((record) => (
                <tr key={record.id} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-slate-950">{record.visitorName}</td>
                  <td className="px-4 py-4">{record.contactNumber}</td>
                  <td className="px-4 py-4">{record.companyName}</td>
                  <td className="px-4 py-4">{record.reasonDetail}</td>
                  <td className="px-4 py-4">{record.contractorSet || "Not provided"}</td>
                  <td className="px-4 py-4">{record.additionalKey || "Not provided"}</td>
                  <td className="px-4 py-4">{formatDateTime(record.signInAt)}</td>
                  <td className="px-4 py-4">{formatDateTime(record.signOutAt)}</td>
                  <td className="px-4 py-4">{getDurationHours(record.signInAt, record.signOutAt) || "Open"}</td>
                  <td className="px-4 py-4">{getRecordStatusLabel(record.recordStatus)}</td>
                </tr>
              ))}
              {records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
                    No staff attendance records match the current filters.
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
