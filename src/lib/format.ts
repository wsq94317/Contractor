import { RecordStatus, SignInType, TaskStatus, VisitorType } from "@prisma/client";

import {
  APP_TIME_ZONE,
  recordStatusOptions,
  signInTypeLabels,
  taskStatusOptions,
  visitorTypeOptions,
} from "@/lib/constants";

export function formatDateTime(value?: Date | null) {
  if (!value) {
    return "Not signed out";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  }).format(value);
}

export function toDateTimeLocal(value?: Date | null) {
  if (!value) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getVisitorTypeLabel(value: VisitorType) {
  return visitorTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function getTaskStatusLabel(value?: TaskStatus | null) {
  if (!value) {
    return "Not signed out";
  }

  return taskStatusOptions.find((option) => option.value === value)?.label ?? value;
}

export function getRecordStatusLabel(value: RecordStatus) {
  return recordStatusOptions.find((option) => option.value === value)?.label ?? value;
}

export function getSignInTypeLabel(value: SignInType) {
  return signInTypeLabels[value] ?? value;
}

export function getDurationHours(signInAt: Date, signOutAt?: Date | null) {
  if (!signOutAt) {
    return "";
  }

  return getDurationHoursValue(signInAt, signOutAt).toFixed(2);
}

export function getDurationHoursValue(signInAt: Date, signOutAt?: Date | null) {
  if (!signOutAt) {
    return 0;
  }

  return (signOutAt.getTime() - signInAt.getTime()) / 3_600_000;
}

const QUARTER_HOUR_MS = 15 * 60 * 1000;

// Rounds a Date to the nearest 15 minute mark using a 7.5 minute threshold.
// 0-7 min → :00, 8-22 → :15, 23-37 → :30, 38-52 → :45, 53-59 → next hour :00.
export function roundToQuarterHour(value: Date): Date {
  return new Date(Math.round(value.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS);
}

export function getRoundedDurationHoursValue(signInAt: Date, signOutAt?: Date | null) {
  if (!signOutAt) {
    return 0;
  }

  const roundedIn = roundToQuarterHour(signInAt);
  const roundedOut = roundToQuarterHour(signOutAt);

  return (roundedOut.getTime() - roundedIn.getTime()) / 3_600_000;
}

export function getRoundedDurationHours(signInAt: Date, signOutAt?: Date | null) {
  if (!signOutAt) {
    return "";
  }

  return getRoundedDurationHoursValue(signInAt, signOutAt).toFixed(2);
}

export function formatTimeOnly(value?: Date | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  }).format(value);
}

export function formatRoundedDateTime(value?: Date | null) {
  if (!value) {
    return "Not signed out";
  }

  return formatDateTime(roundToQuarterHour(value));
}

export function formatRoundedTimeOnly(value?: Date | null) {
  if (!value) {
    return "—";
  }

  return formatTimeOnly(roundToQuarterHour(value));
}
