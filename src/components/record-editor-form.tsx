"use client";

import { RecordStatus, TaskStatus, VisitorType } from "@prisma/client";
import { useActionState } from "react";

import { createAdminRecord, updateAdminRecord } from "@/actions/record-actions";
import { SignaturePadField } from "@/components/signature-pad-field";
import { SubmitButton } from "@/components/submit-button";
import { recordStatusOptions, taskStatusOptions, visitorTypeOptions } from "@/lib/constants";
import { toDateTimeLocal } from "@/lib/format";
import type { ActionState } from "@/lib/validation";

type RecordEditorFormProps = {
  mode: "create" | "edit";
  record?: {
    id: string;
    visitorName: string;
    companyName: string;
    contactNumber: string;
    carRegistrationNumber: string | null;
    visitorType: VisitorType;
    numberOfVisitors: number;
    reasonDetail: string;
    contractorSet: string | null;
    additionalKey: string | null;
    signInSignature: string;
    signInAt: Date;
    recordStatus: RecordStatus;
    signOutAt: Date | null;
    taskStatus: TaskStatus | null;
    signOutNote: string | null;
    keyReturnTo: string | null;
    contractorSignOutSignature: string | null;
    hotelStaffSignature: string | null;
  };
};

const initialState: ActionState = {};

function fieldError(errors: ActionState["errors"], name: string) {
  return errors?.[name]?.[0];
}

export function RecordEditorForm({ mode, record }: RecordEditorFormProps) {
  const action = mode === "create" ? createAdminRecord : updateAdminRecord;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {record ? <input type="hidden" name="recordId" value={record.id} /> : null}

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6914]">
            Sign In Details
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Record information</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="visitorName" className="text-sm font-semibold text-slate-900">
              Visitor Name *
            </label>
            <input
              id="visitorName"
              name="visitorName"
              defaultValue={record?.visitorName}
              required
              className="form-input"
            />
            {fieldError(state.errors, "visitorName") ? (
              <p className="form-error">{fieldError(state.errors, "visitorName")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-semibold text-slate-900">
              Company Name *
            </label>
            <input
              id="companyName"
              name="companyName"
              defaultValue={record?.companyName}
              required
              className="form-input"
            />
            {fieldError(state.errors, "companyName") ? (
              <p className="form-error">{fieldError(state.errors, "companyName")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="contactNumber" className="text-sm font-semibold text-slate-900">
              Contact Number *
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              defaultValue={record?.contactNumber}
              required
              className="form-input"
            />
            {fieldError(state.errors, "contactNumber") ? (
              <p className="form-error">{fieldError(state.errors, "contactNumber")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="carRegistrationNumber"
              className="text-sm font-semibold text-slate-900"
            >
              Car Registration Number
            </label>
            <input
              id="carRegistrationNumber"
              name="carRegistrationNumber"
              defaultValue={record?.carRegistrationNumber ?? ""}
              className="form-input"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="visitorType" className="text-sm font-semibold text-slate-900">
              Visitor Type *
            </label>
            <select
              id="visitorType"
              name="visitorType"
              defaultValue={record?.visitorType ?? VisitorType.CONTRACTOR}
              required
              className="form-input"
            >
              {visitorTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError(state.errors, "visitorType") ? (
              <p className="form-error">{fieldError(state.errors, "visitorType")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="numberOfVisitors" className="text-sm font-semibold text-slate-900">
              Number of Visitors *
            </label>
            <input
              id="numberOfVisitors"
              name="numberOfVisitors"
              type="number"
              min="1"
              defaultValue={record?.numberOfVisitors ?? 1}
              required
              className="form-input"
            />
            {fieldError(state.errors, "numberOfVisitors") ? (
              <p className="form-error">{fieldError(state.errors, "numberOfVisitors")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="contractorSet" className="text-sm font-semibold text-slate-900">
              Contractor Set
            </label>
            <input
              id="contractorSet"
              name="contractorSet"
              defaultValue={record?.contractorSet ?? ""}
              className="form-input"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="reasonDetail" className="text-sm font-semibold text-slate-900">
              Reason/Detail of the Visit *
            </label>
            <textarea
              id="reasonDetail"
              name="reasonDetail"
              rows={4}
              defaultValue={record?.reasonDetail}
              required
              className="form-input"
            />
            {fieldError(state.errors, "reasonDetail") ? (
              <p className="form-error">{fieldError(state.errors, "reasonDetail")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="additionalKey" className="text-sm font-semibold text-slate-900">
              Additional Key
            </label>
            <input
              id="additionalKey"
              name="additionalKey"
              defaultValue={record?.additionalKey ?? ""}
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signInAt" className="text-sm font-semibold text-slate-900">
              Sign In Time *
            </label>
            <input
              id="signInAt"
              name="signInAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(record?.signInAt ?? new Date())}
              required
              className="form-input"
            />
            {fieldError(state.errors, "signInAt") ? (
              <p className="form-error">{fieldError(state.errors, "signInAt")}</p>
            ) : null}
          </div>
        </div>

        <SignaturePadField
          label="Sign In Signature"
          name="signInSignature"
          required
          defaultValue={record?.signInSignature}
          error={fieldError(state.errors, "signInSignature")}
        />
      </section>

      <section className="space-y-6 border-t border-slate-200 pt-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6914]">
            Sign Out Details
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Closure information</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="recordStatus" className="text-sm font-semibold text-slate-900">
              Record Status *
            </label>
            <select
              id="recordStatus"
              name="recordStatus"
              defaultValue={record?.recordStatus ?? RecordStatus.OPEN}
              className="form-input"
            >
              {recordStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="signOutAt" className="text-sm font-semibold text-slate-900">
              Sign Out Time
            </label>
            <input
              id="signOutAt"
              name="signOutAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(record?.signOutAt ?? null)}
              className="form-input"
            />
            {fieldError(state.errors, "signOutAt") ? (
              <p className="form-error">{fieldError(state.errors, "signOutAt")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="taskStatus" className="text-sm font-semibold text-slate-900">
              Task Status
            </label>
            <select
              id="taskStatus"
              name="taskStatus"
              defaultValue={record?.taskStatus ?? TaskStatus.COMPLETE}
              className="form-input"
            >
              {taskStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError(state.errors, "taskStatus") ? (
              <p className="form-error">{fieldError(state.errors, "taskStatus")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="keyReturnTo" className="text-sm font-semibold text-slate-900">
              Key Return to
            </label>
            <input
              id="keyReturnTo"
              name="keyReturnTo"
              defaultValue={record?.keyReturnTo ?? ""}
              className="form-input"
            />
            {fieldError(state.errors, "keyReturnTo") ? (
              <p className="form-error">{fieldError(state.errors, "keyReturnTo")}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="signOutNote" className="text-sm font-semibold text-slate-900">
              Note
            </label>
            <textarea
              id="signOutNote"
              name="signOutNote"
              rows={3}
              defaultValue={record?.signOutNote ?? ""}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <SignaturePadField
            label="Contractor Sign Out Signature"
            name="contractorSignOutSignature"
            defaultValue={record?.contractorSignOutSignature}
            error={fieldError(state.errors, "contractorSignOutSignature")}
          />
          <SignaturePadField
            label="Hotel Staff Signature"
            name="hotelStaffSignature"
            defaultValue={record?.hotelStaffSignature}
            error={fieldError(state.errors, "hotelStaffSignature")}
          />
        </div>
      </section>

      {state.message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      <SubmitButton
        label={mode === "create" ? "Create Record" : "Save Changes"}
        pendingLabel="Saving..."
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0f2350] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#17346f] disabled:cursor-not-allowed disabled:opacity-70"
      />
    </form>
  );
}
