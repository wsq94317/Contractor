import { getDurationHoursValue } from "@/lib/format";

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

export function groupStaffAttendanceRecords<T extends AttendanceRecord>(records: T[]) {
  const groups = new Map<
    string,
    {
      groupKey: string;
      staffName: string;
      phone: string;
      position: string;
      totalHours: number;
      records: T[];
    }
  >();

  const sortedRecords = [...records].sort((left, right) => {
    const leftName = left.staffProfile?.name ?? left.visitorName;
    const rightName = right.staffProfile?.name ?? right.visitorName;

    return (
      leftName.localeCompare(rightName, "en-AU") || left.signInAt.getTime() - right.signInAt.getTime()
    );
  });

  for (const record of sortedRecords) {
    const groupKey = record.staffProfileId ?? `legacy:${record.visitorName}`;
    const existingGroup = groups.get(groupKey);

    if (existingGroup) {
      existingGroup.records.push(record);
      existingGroup.totalHours += getDurationHoursValue(record.signInAt, record.signOutAt);
      continue;
    }

    groups.set(groupKey, {
      groupKey,
      staffName: record.staffProfile?.name ?? record.visitorName,
      phone: record.staffProfile?.phone ?? record.contactNumber,
      position: record.staffProfile?.position ?? "",
      totalHours: getDurationHoursValue(record.signInAt, record.signOutAt),
      records: [record],
    });
  }

  return [...groups.values()];
}
