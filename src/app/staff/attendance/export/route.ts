import { format } from "date-fns";

import { getValidatedStaffSession, isSuperAdmin } from "@/lib/auth";
import { groupStaffAttendanceByWeek } from "@/lib/attendance";
import { getStaffAttendanceRecords } from "@/lib/data";
import {
  formatDateTime,
  formatRoundedDateTime,
  getDurationHours,
  getRecordStatusLabel,
  getRoundedDurationHours,
} from "@/lib/format";

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await getValidatedStaffSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isSuperAdmin(session.username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const records = await getStaffAttendanceRecords({
    hotelId: session.hotelId,
    q,
    dateFrom,
    dateTo,
  });
  const weekGroups = groupStaffAttendanceByWeek(records);

  const header = [
    "Hotel",
    "Week",
    "Week Start",
    "Week End",
    "Staff Name",
    "Phone",
    "Position",
    "Date",
    "Task",
    "Key Set",
    "Additional Key",
    "Actual Sign In",
    "Actual Sign Out",
    "Actual Hours",
    "Rounded Sign In",
    "Rounded Sign Out",
    "Payroll Hours",
    "Status",
  ];

  const rows: string[][] = [];

  for (const week of weekGroups) {
    const weekLabel = `Week ${week.isoWeek} ${week.isoYear}`;
    const weekStartLabel = format(week.weekStart, "yyyy-MM-dd");
    const weekEndLabel = format(week.weekEnd, "yyyy-MM-dd");

    for (const group of week.staffGroups) {
      for (const record of group.records) {
        rows.push([
          session.hotelShortName,
          weekLabel,
          weekStartLabel,
          weekEndLabel,
          group.staffName,
          group.phone,
          group.position,
          format(record.signInAt, "yyyy-MM-dd"),
          record.reasonDetail,
          record.contractorSet ?? "",
          record.additionalKey ?? "",
          formatDateTime(record.signInAt),
          formatDateTime(record.signOutAt),
          getDurationHours(record.signInAt, record.signOutAt),
          formatRoundedDateTime(record.signInAt),
          formatRoundedDateTime(record.signOutAt),
          getRoundedDurationHours(record.signInAt, record.signOutAt),
          getRecordStatusLabel(record.recordStatus),
        ]);
      }

      // Per-staff weekly subtotal.
      rows.push([
        session.hotelShortName,
        weekLabel,
        weekStartLabel,
        weekEndLabel,
        group.staffName,
        group.phone,
        group.position,
        "",
        "Staff Week Subtotal",
        "",
        "",
        "",
        "",
        group.totals.actualHours.toFixed(2),
        "",
        "",
        group.totals.payrollHours.toFixed(2),
        "",
      ]);
    }

    // Whole-week total.
    rows.push([
      session.hotelShortName,
      weekLabel,
      weekStartLabel,
      weekEndLabel,
      "",
      "",
      "",
      "",
      "Week Total",
      "",
      "",
      "",
      "",
      week.totals.actualHours.toFixed(2),
      "",
      "",
      week.totals.payrollHours.toFixed(2),
      "",
    ]);
  }

  const csv = [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
    .join("\n");

  const filename = `staff-attendance-${session.hotelSlug}${
    dateFrom ? `-${dateFrom}` : ""
  }${dateTo ? `_${dateTo}` : ""}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
