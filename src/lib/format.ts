import { RecordStatus, TaskStatus, VisitorType } from "@prisma/client";

import {
  APP_TIME_ZONE,
  recordStatusOptions,
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
