import { getValidatedStaffSession, isSuperAdmin } from "@/lib/auth";
import { groupStaffAttendanceRecords } from "@/lib/attendance";
import { getStaffAttendanceRecords } from "@/lib/data";
import { formatDateTime, getDurationHours, getRecordStatusLabel } from "@/lib/format";

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
  const groupedRecords = groupStaffAttendanceRecords(records);

  const header = [
    "Hotel",
    "Staff Name",
    "Phone",
    "Position",
    "Date",
    "Task",
    "Key Set",
    "Additional Key",
    "Sign In",
    "Sign Out",
    "Hours",
    "Status",
  ];

  const rows = groupedRecords.flatMap((group) => {
    const detailRows = group.records.map((record) => [
      session.hotelShortName,
      group.staffName,
      group.phone,
      group.position,
      new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(record.signInAt),
      record.reasonDetail,
      record.contractorSet ?? "",
      record.additionalKey ?? "",
      formatDateTime(record.signInAt),
      formatDateTime(record.signOutAt),
      getDurationHours(record.signInAt, record.signOutAt),
      getRecordStatusLabel(record.recordStatus),
    ]);

    detailRows.push([
      session.hotelShortName,
      group.staffName,
      group.phone,
      group.position,
      "",
      "Total Hours",
      "",
      "",
      "",
      "",
      group.totalHours.toFixed(2),
      "",
    ]);

    return detailRows;
  });

  const csv = [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="staff-attendance-${session.hotelSlug}.csv"`,
    },
  });
}
