"use client";

import Link from "next/link";
import { RecordStatus, SignInType, TaskStatus, VisitorType } from "@prisma/client";
import { useState } from "react";

import { softDeleteRecord } from "@/actions/record-actions";
import {
  getRecordStatusLabel,
  getSignInTypeLabel,
  getTaskStatusLabel,
  getVisitorTypeLabel,
} from "@/lib/format";

type RecordManagementPanelProps = {
  canManageRecords: boolean;
  records: Array<{
    id: string;
    signInType: SignInType;
    visitorName: string;
    companyName: string;
    contactNumber: string;
    carRegistrationNumber: string | null;
    visitorType: VisitorType;
    numberOfVisitors: number;
    reasonDetail: string;
    contractorSet: string | null;
    additionalKey: string | null;
    recordStatus: RecordStatus;
    taskStatus: TaskStatus | null;
    keyReturnTo: string | null;
    signOutNote: string | null;
    signInLabel: string;
    signOutLabel: string;
    signInTimestamp: number;
    signOutTimestamp: number | null;
    hoursLabel: string;
    hoursValue: number;
    canSettle: boolean;
  }>;
};

function groupSelectedRecords(
  records: RecordManagementPanelProps["records"],
  selectedIds: string[],
) {
  const groups = new Map<
    string,
    {
      visitorName: string;
      contactNumber: string;
      totalHours: number;
      latestSignOutTimestamp: number | null;
      records: RecordManagementPanelProps["records"];
    }
  >();

  const selectedRecords = records.filter((record) => selectedIds.includes(record.id) && record.canSettle);

  for (const record of selectedRecords) {
    const existingGroup = groups.get(record.visitorName);

    if (existingGroup) {
      existingGroup.records.push(record);
      existingGroup.totalHours += record.hoursValue;
      if (
        record.signOutTimestamp &&
        (!existingGroup.latestSignOutTimestamp ||
          record.signOutTimestamp > existingGroup.latestSignOutTimestamp)
      ) {
        existingGroup.latestSignOutTimestamp = record.signOutTimestamp;
      }
      continue;
    }

    groups.set(record.visitorName, {
      visitorName: record.visitorName,
      contactNumber: record.contactNumber,
      totalHours: record.hoursValue,
      latestSignOutTimestamp: record.signOutTimestamp,
      records: [record],
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      records: [...group.records].sort((left, right) => {
        const rightTime = right.signOutTimestamp ?? right.signInTimestamp;
        const leftTime = left.signOutTimestamp ?? left.signInTimestamp;
        return rightTime - leftTime;
      }),
    }))
    .sort((left, right) => {
      if (!left.latestSignOutTimestamp && !right.latestSignOutTimestamp) {
        return left.visitorName.localeCompare(right.visitorName, "en-AU");
      }

      if (!left.latestSignOutTimestamp) {
        return 1;
      }

      if (!right.latestSignOutTimestamp) {
        return -1;
      }

      return (
        right.latestSignOutTimestamp - left.latestSignOutTimestamp ||
        left.visitorName.localeCompare(right.visitorName, "en-AU")
      );
    });
}

export function RecordManagementPanel({
  canManageRecords,
  records,
}: RecordManagementPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const selectedRecords = records.filter((record) => selectedIds.includes(record.id));
  const groupedSelectedRecords = groupSelectedRecords(records, selectedIds);
  const totalSelectedHours = selectedRecords.reduce((total, record) => total + record.hoursValue, 0);
  const selectableRecordIds = records.filter((record) => record.canSettle).map((record) => record.id);

  function toggleRecord(recordId: string) {
    setSelectedIds((current) =>
      current.includes(recordId)
        ? current.filter((id) => id !== recordId)
        : [...current, recordId],
    );
  }

  function selectAllVisibleClosed() {
    setSelectedIds(selectableRecordIds);
  }

  function clearSelection() {
    setSelectedIds([]);
    setIsHoursModalOpen(false);
  }

  if (records.length === 0) {
    return (
      <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
        No records match the current filters.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8b6914]">Hours Settlement</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Hours settlement</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tick closed records after filtering by visitor name and date, then preview grouped hours by person.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAllVisibleClosed}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0f2350] transition hover:border-[#0f2350]"
            >
              Select all visible closed
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => setIsHoursModalOpen(true)}
              disabled={groupedSelectedRecords.length === 0}
              className="rounded-full border border-[#0f2350] bg-[#0f2350] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17346f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Preview hours record
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected Records</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedRecords.length}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected Staff</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{groupedSelectedRecords.length}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Hours</p>
            <p className="mt-2 text-3xl font-semibold text-[#0f2350]">{totalSelectedHours.toFixed(2)}</p>
          </div>
        </div>
      </section>

      <div className="hidden rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 xl:grid xl:grid-cols-[auto_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] xl:gap-4">
        <span>Tick</span>
        <span>Visitor</span>
        <span>Company</span>
        <span>Visitor Type</span>
        <span>In / Out / Hours</span>
        <span>Actions</span>
      </div>

      {records.map((record) => {
        const isSelected = selectedIds.includes(record.id);

        return (
          <article
            key={record.id}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
          >
            <div className="flex flex-col gap-4 px-5 py-5 xl:grid xl:grid-cols-[auto_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] xl:items-center xl:gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!record.canSettle}
                  onChange={() => toggleRecord(record.id)}
                  className="h-5 w-5 rounded border-slate-300 text-[#0f2350] focus:ring-[#0f2350] disabled:cursor-not-allowed disabled:opacity-40"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {record.canSettle ? "Settle" : "Open"}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-950">{record.visitorName}</p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      record.recordStatus === RecordStatus.OPEN
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {getRecordStatusLabel(record.recordStatus)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{record.contactNumber}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{record.reasonDetail}</p>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{record.companyName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Car: {record.carRegistrationNumber || "No vehicle"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {getVisitorTypeLabel(record.visitorType)}
                </p>
                <p className="mt-1 text-sm text-slate-500">Visitors: {record.numberOfVisitors}</p>
              </div>

              <div className="min-w-0 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">In:</span> {record.signInLabel}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Out:</span> {record.signOutLabel}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Hours:</span>{" "}
                  {record.canSettle ? record.hoursLabel : "Open"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Link
                  href={`/staff/records/${record.id}`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0f2350] transition hover:border-[#0f2350] hover:bg-slate-50"
                >
                  View
                </Link>
                {canManageRecords ? (
                  <Link
                    href={`/staff/records/${record.id}/edit`}
                    className="rounded-full border border-[#d4a62a] px-4 py-2 text-sm font-semibold text-[#8b6914] transition hover:bg-[#fff8df]"
                  >
                    Edit
                  </Link>
                ) : null}
                {canManageRecords ? (
                  <form action={softDeleteRecord.bind(null, record.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <details className="border-t border-slate-200 bg-slate-50/70">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[#0f2350] marker:hidden">
                Expand details
              </summary>
              <div className="grid gap-4 px-5 pb-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Task Status", getTaskStatusLabel(record.taskStatus)],
                  ["Key Return", record.keyReturnTo || "Pending"],
                  ["Key Set", record.contractorSet || "Not provided"],
                  ["Additional Key", record.additionalKey || "Not provided"],
                  ["Sign Out Note", record.signOutNote || "No note"],
                  ["Sign In Type", getSignInTypeLabel(record.signInType)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[20px] border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </details>
          </article>
        );
      })}

      {isHoursModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.3)] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Hours Record</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Selected hours by person</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Records are grouped by visitor name and totalled the same way as Staff Attendance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHoursModalOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected Records</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedRecords.length}</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected Staff</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{groupedSelectedRecords.length}</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Hours</p>
                <p className="mt-2 text-3xl font-semibold text-[#0f2350]">{totalSelectedHours.toFixed(2)}</p>
              </div>
            </div>

            {groupedSelectedRecords.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                No closed records are selected yet.
              </div>
            ) : (
              <div className="space-y-6">
                {groupedSelectedRecords.map((group) => (
                  <section
                    key={group.visitorName}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
                  >
                    <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Visitor</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">{group.visitorName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{group.contactNumber}</p>
                      </div>
                      <div className="text-sm font-semibold text-[#0f2350]">
                        Total Hours: {group.totalHours.toFixed(2)}
                      </div>
                    </div>

                    <div className="hidden border-b border-slate-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_0.65fr_0.8fr] xl:gap-4">
                      <span>Company</span>
                      <span>Task</span>
                      <span>In / Out</span>
                      <span>Hours</span>
                      <span>Status</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {group.records.map((record) => (
                        <article
                          key={record.id}
                          className="flex flex-col gap-4 px-5 py-5 hover:bg-slate-50 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_0.65fr_0.8fr] xl:items-center xl:gap-4"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{record.companyName}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {getVisitorTypeLabel(record.visitorType)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{record.reasonDetail}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              Key Set: {record.contractorSet || "Not provided"}
                              {" | "}
                              Additional Key: {record.additionalKey || "Not provided"}
                            </p>
                          </div>

                          <div className="min-w-0 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-900">In:</span> {record.signInLabel}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold text-slate-900">Out:</span> {record.signOutLabel}
                            </p>
                          </div>

                          <div className="font-semibold text-[#0f2350]">{record.hoursLabel}</div>

                          <div className="text-sm font-semibold text-slate-700">
                            {getRecordStatusLabel(record.recordStatus)}
                          </div>
                        </article>
                      ))}

                      <div className="flex items-center justify-between gap-4 bg-slate-50 px-5 py-4">
                        <p className="font-semibold text-slate-700">Total Hours</p>
                        <p className="font-semibold text-[#0f2350]">{group.totalHours.toFixed(2)}</p>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
