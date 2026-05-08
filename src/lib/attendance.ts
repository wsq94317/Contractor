import { format, getISOWeek, startOfWeek, endOfWeek } from "date-fns";

import { getDurationHoursValue, getRoundedDurationHoursValue } from "@/lib/format";

type AttendanceRecord = {
  id: string;
  visitorName: string;
  contactNumber: string;
  companyName: string;
  reasonDetail: string;
  contractorSet: string | null;
  additionalKey: string | null;
  signInAt: Date;
  signOutAt: Date | null;
  recordStatus: string;
  staffProfileId: string | null;
  staffProfile: {
    id: string;
    name: string;
    phone: string;
    position: string;
  } | null;
};

export type StaffAttendanceTotals = {
  actualHours: number;
  payrollHours: number;
};

export type StaffAttendanceStaffGroup<T> = {
  groupKey: string;
  staffName: string;
  phone: string;
  position: string;
  totals: StaffAttendanceTotals;
  records: T[];
};

export type StaffAttendanceWeekGroup<T> = {
  weekKey: string;
  weekStart: Date;
  weekEnd: Date;
  isoWeek: number;
  isoYear: number;
  totals: StaffAttendanceTotals;
  staffCount: number;
  staffGroups: StaffAttendanceStaffGroup<T>[];
};

const WEEK_OPTIONS = { weekStartsOn: 1 as const };

function makeWeekKey(date: Date) {
  // ISO week year may differ from calendar year near year boundaries; use the
  // week-start to derive a stable key.
  const start = startOfWeek(date, WEEK_OPTIONS);
  return format(start, "yyyy-MM-dd");
}

function emptyTotals(): StaffAttendanceTotals {
  return { actualHours: 0, payrollHours: 0 };
}

function addDuration(target: StaffAttendanceTotals, record: AttendanceRecord) {
  target.actualHours += getDurationHoursValue(record.signInAt, record.signOutAt);
  target.payrollHours += getRoundedDurationHoursValue(record.signInAt, record.signOutAt);
}

export function groupStaffAttendanceByWeek<T extends AttendanceRecord>(records: T[]) {
  const weekMap = new Map<
    string,
    {
      weekStart: Date;
      weekEnd: Date;
      totals: StaffAttendanceTotals;
      staffMap: Map<string, StaffAttendanceStaffGroup<T>>;
    }
  >();

  for (const record of records) {
    const weekKey = makeWeekKey(record.signInAt);
    let week = weekMap.get(weekKey);

    if (!week) {
      const weekStart = startOfWeek(record.signInAt, WEEK_OPTIONS);
      const weekEnd = endOfWeek(record.signInAt, WEEK_OPTIONS);
      week = {
        weekStart,
        weekEnd,
        totals: emptyTotals(),
        staffMap: new Map(),
      };
      weekMap.set(weekKey, week);
    }

    const staffKey = record.staffProfileId ?? `legacy:${record.visitorName}`;
    let staffGroup = week.staffMap.get(staffKey);

    if (!staffGroup) {
      staffGroup = {
        groupKey: staffKey,
        staffName: record.staffProfile?.name ?? record.visitorName,
        phone: record.staffProfile?.phone ?? record.contactNumber,
        position: record.staffProfile?.position ?? "",
        totals: emptyTotals(),
        records: [],
      };
      week.staffMap.set(staffKey, staffGroup);
    }

    staffGroup.records.push(record);
    addDuration(staffGroup.totals, record);
    addDuration(week.totals, record);
  }

  const weekGroups: StaffAttendanceWeekGroup<T>[] = [];

  for (const [weekKey, week] of weekMap.entries()) {
    const staffGroups = [...week.staffMap.values()]
      .map((group) => ({
        ...group,
        records: [...group.records].sort(
          (a, b) => a.signInAt.getTime() - b.signInAt.getTime(),
        ),
      }))
      .sort((a, b) => a.staffName.localeCompare(b.staffName, "en-AU"));

    weekGroups.push({
      weekKey,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      isoWeek: getISOWeek(week.weekStart),
      isoYear: Number(format(week.weekStart, "RRRR")),
      totals: week.totals,
      staffCount: staffGroups.length,
      staffGroups,
    });
  }

  // Most recent week first.
  weekGroups.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  return weekGroups;
}

export function summarizeAttendanceTotals<T extends AttendanceRecord>(
  records: T[],
): StaffAttendanceTotals & { staffCount: number; openCount: number } {
  const totals = emptyTotals();
  const staffKeys = new Set<string>();
  let openCount = 0;

  for (const record of records) {
    addDuration(totals, record);
    staffKeys.add(record.staffProfileId ?? `legacy:${record.visitorName}`);
    if (!record.signOutAt) {
      openCount += 1;
    }
  }

  return {
    ...totals,
    staffCount: staffKeys.size,
    openCount,
  };
}
