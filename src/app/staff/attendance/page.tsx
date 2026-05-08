import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffAdminTabs } from "@/components/staff-admin-tabs";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import {
  groupStaffAttendanceByWeek,
  summarizeAttendanceTotals,
  type StaffAttendanceWeekGroup,
} from "@/lib/attendance";
import { getStaffAttendanceRecords } from "@/lib/data";
import {
  formatTimeOnly,
  formatRoundedTimeOnly,
  getDurationHoursValue,
  getRecordStatusLabel,
  getRoundedDurationHoursValue,
} from "@/lib/format";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const WEEK_OPTIONS = { weekStartsOn: 1 as const };
const DATE_INPUT_FORMAT = "yyyy-MM-dd";

type Range = { dateFrom: string; dateTo: string };

function rangeForOffset(today: Date, weeksBack: number, weeksSpan: number): Range {
  const startBase = subWeeks(today, weeksBack + (weeksSpan - 1));
  const start = startOfWeek(startBase, WEEK_OPTIONS);
  const endBase = subWeeks(today, weeksBack);
  const end = endOfWeek(endBase, WEEK_OPTIONS);
  return {
    dateFrom: format(start, DATE_INPUT_FORMAT),
    dateTo: format(end, DATE_INPUT_FORMAT),
  };
}

const QUICK_RANGE_KEYS = ["thisWeek", "lastWeek", "last2Weeks", "last4Weeks"] as const;
type QuickRangeKey = (typeof QUICK_RANGE_KEYS)[number];

function quickRange(today: Date, key: QuickRangeKey): Range {
  switch (key) {
    case "thisWeek":
      return rangeForOffset(today, 0, 1);
    case "lastWeek":
      return rangeForOffset(today, 1, 1);
    case "last2Weeks":
      return rangeForOffset(today, 0, 2);
    case "last4Weeks":
      return rangeForOffset(today, 0, 4);
  }
}

const QUICK_RANGE_LABELS: Record<QuickRangeKey, string> = {
  thisWeek: "This Week",
  lastWeek: "Last Week",
  last2Weeks: "Last 2 Weeks",
  last4Weeks: "Last 4 Weeks",
};

function detectActiveQuickRange(today: Date, range: Range): QuickRangeKey | null {
  for (const key of QUICK_RANGE_KEYS) {
    const candidate = quickRange(today, key);
    if (candidate.dateFrom === range.dateFrom && candidate.dateTo === range.dateTo) {
      return key;
    }
  }
  return null;
}

function buildExportHref(q: string, range: Range) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("dateFrom", range.dateFrom);
  params.set("dateTo", range.dateTo);
  return `/staff/attendance/export?${params.toString()}`;
}

function buildQuickRangeHref(q: string, range: Range) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("dateFrom", range.dateFrom);
  params.set("dateTo", range.dateTo);
  return `/staff/attendance?${params.toString()}`;
}

function formatHours(value: number) {
  return value.toFixed(2);
}

function formatWeekLabel(group: Pick<StaffAttendanceWeekGroup<unknown>, "weekStart" | "weekEnd">) {
  const start = format(group.weekStart, "EEE d LLL");
  const end = format(group.weekEnd, "EEE d LLL yyyy");
  return `${start} – ${end}`;
}

export default async function StaffAttendancePage({ searchParams }: PageProps) {
  const session = await requireStaffSession();
  const isAdmin = isSuperAdmin(session.username);

  if (!isAdmin) {
    redirect("/staff/records");
  }

  const today = new Date();
  const resolvedSearchParams = await searchParams;

  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const rawDateFrom =
    typeof resolvedSearchParams.dateFrom === "string" ? resolvedSearchParams.dateFrom : "";
  const rawDateTo =
    typeof resolvedSearchParams.dateTo === "string" ? resolvedSearchParams.dateTo : "";

  // Default to the current ISO week when no range is provided.
  const effectiveRange: Range =
    rawDateFrom || rawDateTo
      ? { dateFrom: rawDateFrom, dateTo: rawDateTo }
      : quickRange(today, "thisWeek");

  const records = await getStaffAttendanceRecords({
    hotelId: session.hotelId,
    q,
    dateFrom: effectiveRange.dateFrom,
    dateTo: effectiveRange.dateTo,
  });

  const summary = summarizeAttendanceTotals(records);
  const weekGroups = groupStaffAttendanceByWeek(records);
  const activeQuickRange = detectActiveQuickRange(today, effectiveRange);

  return (
    <div className="space-y-8">
      <StaffAdminTabs current="attendance" canViewAttendance />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Staff Members</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{summary.staffCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {records.length} attendance record{records.length === 1 ? "" : "s"} in range
          </p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Actual Hours</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">
            {formatHours(summary.actualHours)}
          </p>
          <p className="mt-1 text-xs text-slate-500">From raw sign-in / sign-out times</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-[#8b6914]">Payroll Hours</p>
          <p className="mt-4 text-4xl font-semibold text-[#0f2350]">
            {formatHours(summary.payrollHours)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Rounded to nearest 15 minutes</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Open</p>
          <p className="mt-4 text-4xl font-semibold text-[#8b6914]">{summary.openCount}</p>
          <p className="mt-1 text-xs text-slate-500">Records still awaiting sign-out</p>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Admin</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Staff Attendance</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {effectiveRange.dateFrom} → {effectiveRange.dateTo} · weeks start Monday
            </p>
          </div>
          <Link
            href={buildExportHref(q, effectiveRange)}
            className="inline-flex items-center justify-center rounded-full border border-[#0f2350] bg-[#0f2350] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17346f]"
          >
            Export CSV
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {QUICK_RANGE_KEYS.map((key) => {
            const range = quickRange(today, key);
            const active = activeQuickRange === key;
            return (
              <Link
                key={key}
                href={buildQuickRangeHref(q, range)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-[#0f2350] bg-[#0f2350] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#0f2350] hover:text-[#0f2350]"
                }`}
              >
                {QUICK_RANGE_LABELS[key]}
              </Link>
            );
          })}
        </div>

        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search staff name, phone, position, task"
            className="form-input"
          />
          <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            From
            <input
              type="date"
              name="dateFrom"
              defaultValue={effectiveRange.dateFrom}
              className="form-input mt-1"
            />
          </label>
          <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            To
            <input
              type="date"
              name="dateTo"
              defaultValue={effectiveRange.dateTo}
              className="form-input mt-1"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-full border border-[#d4a62a] bg-[#d4a62a] px-5 py-3 text-sm font-semibold text-[#0f2350] transition hover:bg-[#f3cc5f]"
          >
            Apply
          </button>
        </form>

        {weekGroups.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            No staff attendance records match the current filters.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {weekGroups.map((week, index) => (
              <WeekCard key={week.weekKey} week={week} defaultOpen={index === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type WeekCardRecord = Awaited<ReturnType<typeof getStaffAttendanceRecords>>[number];

function WeekCard({
  week,
  defaultOpen,
}: {
  week: StaffAttendanceWeekGroup<WeekCardRecord>;
  defaultOpen: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-2 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#0f2350] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            Week {week.isoWeek}
          </span>
          <div>
            <p className="text-base font-semibold text-slate-950">{formatWeekLabel(week)}</p>
            <p className="text-xs text-slate-500">
              {week.staffCount} staff · {week.staffGroups.reduce((sum, g) => sum + g.records.length, 0)} record
              {week.staffGroups.reduce((sum, g) => sum + g.records.length, 0) === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Actual</p>
            <p className="font-semibold text-slate-900">{formatHours(week.totals.actualHours)} h</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b6914]">Payroll</p>
            <p className="font-semibold text-[#0f2350]">{formatHours(week.totals.payrollHours)} h</p>
          </div>
          <span
            aria-hidden
            className="text-slate-400 transition group-open:rotate-180"
          >
            ▾
          </span>
        </div>
      </summary>

      <div className="space-y-5 px-5 py-5">
        {week.staffGroups.map((group) => (
          <article
            key={group.groupKey}
            className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"
          >
            <header className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Staff</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{group.staffName}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {group.phone}
                  {group.position ? ` · ${group.position}` : ""}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Actual</p>
                  <p className="font-semibold text-slate-900">
                    {formatHours(group.totals.actualHours)} h
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b6914]">Payroll</p>
                  <p className="font-semibold text-[#0f2350]">
                    {formatHours(group.totals.payrollHours)} h
                  </p>
                </div>
              </div>
            </header>

            <div className="hidden border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_auto] lg:gap-4">
              <span>Date</span>
              <span>Task</span>
              <span>Actual</span>
              <span>Rounded (Payroll)</span>
              <span>Hours</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {group.records.map((record) => {
                const actualHours = getDurationHoursValue(record.signInAt, record.signOutAt);
                const payrollHours = getRoundedDurationHoursValue(
                  record.signInAt,
                  record.signOutAt,
                );
                const isOpen = !record.signOutAt;

                return (
                  <div
                    key={record.id}
                    className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_auto] lg:items-center lg:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {format(record.signInAt, "EEE d LLL")}
                      </p>
                      <p className="text-xs text-slate-500">{format(record.signInAt, "yyyy")}</p>
                    </div>

                    <div className="min-w-0 text-sm text-slate-700">
                      <p className="truncate">{record.reasonDetail}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Key: {record.contractorSet || "—"}
                        {record.additionalKey ? ` · +${record.additionalKey}` : ""}
                      </p>
                    </div>

                    <div className="text-sm text-slate-700">
                      <p>
                        <span className="font-mono">{formatTimeOnly(record.signInAt)}</span>
                        {" → "}
                        <span className="font-mono">{formatTimeOnly(record.signOutAt)}</span>
                      </p>
                      <p className="text-xs text-slate-500">{formatHours(actualHours)} h actual</p>
                    </div>

                    <div className="text-sm text-[#0f2350]">
                      <p>
                        <span className="font-mono">{formatRoundedTimeOnly(record.signInAt)}</span>
                        {" → "}
                        <span className="font-mono">{formatRoundedTimeOnly(record.signOutAt)}</span>
                      </p>
                      <p className="text-xs text-[#8b6914]">{formatHours(payrollHours)} h payroll</p>
                    </div>

                    <div className="text-sm font-semibold">
                      {isOpen ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-800">
                          Open
                        </span>
                      ) : (
                        <span className="text-[#0f2350]">{formatHours(payrollHours)} h</span>
                      )}
                    </div>

                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {getRecordStatusLabel(
                        record.recordStatus as Parameters<typeof getRecordStatusLabel>[0],
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Link
                        href={`/staff/records/${record.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0f2350] transition hover:border-[#0f2350] hover:bg-white"
                      >
                        View
                      </Link>
                      <Link
                        href={`/staff/records/${record.id}/edit`}
                        className="rounded-full border border-[#d4a62a] px-3 py-1.5 text-xs font-semibold text-[#8b6914] transition hover:bg-[#fff8df]"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}

        <p className="text-xs text-slate-400">
          Tip: Actual reflects raw clock times. Payroll rounds each sign-in / sign-out to the nearest
          15 minutes (≥8 min rounds up).
        </p>
      </div>
    </details>
  );
}
