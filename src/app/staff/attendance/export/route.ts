import { getValidatedStaffSession } from "@/lib/auth";
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

  const header = [
    "Hotel",
    "Staff Name",
    "Phone",
    "Position",
    "Task",
    "Key Set",
    "Additional Key",
    "Sign In",
    "Sign Out",
    "Hours",
    "Status",
  ];

  const rows = records.map((record) => [
    session.hotelShortName,
    record.visitorName,
    record.contactNumber,
    record.companyName,
    record.reasonDetail,
    record.contractorSet ?? "",
    record.additionalKey ?? "",
    formatDateTime(record.signInAt),
    formatDateTime(record.signOutAt),
    getDurationHours(record.signInAt, record.signOutAt),
    getRecordStatusLabel(record.recordStatus),
  ]);

  const csv = [header, ...rows].map((row) => row.map((value) => escapeCsv(String(value))).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="staff-attendance-${session.hotelSlug}.csv"`,
    },
  });
}
