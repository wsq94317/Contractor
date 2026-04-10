"use client";

import { TaskStatus } from "@prisma/client";
import { useActionState } from "react";

import { submitSignOut } from "@/actions/public-actions";
import { SignaturePadField } from "@/components/signature-pad-field";
import { SubmitButton } from "@/components/submit-button";
import { taskStatusOptions } from "@/lib/constants";
import type { ActionState } from "@/lib/validation";

type SignOutFormProps = {
  hotelSlug: string;
  openRecords: Array<{
    id: string;
    visitorName: string;
    companyName: string;
    signInAt: Date;
    additionalKey: string | null;
  }>;
};

const initialState: ActionState = {};

function fieldError(errors: ActionState["errors"], name: string) {
  return errors?.[name]?.[0];
}

export function SignOutForm({ hotelSlug, openRecords }: SignOutFormProps) {
  const [state, formAction] = useActionState(submitSignOut, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="hotelSlug" value={hotelSlug} />

      <div className="space-y-2">
        <label htmlFor="visitRecordId" className="text-sm font-semibold text-slate-900">
          Visitor Name *
        </label>
        <select id="visitRecordId" name="visitRecordId" required className="form-input">
          <option value="">Select an active sign in record</option>
          {openRecords.map((record) => (
            <option key={record.id} value={record.id}>
              {record.visitorName} | {record.companyName} | Signed in{" "}
              {new Intl.DateTimeFormat("en-AU", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(record.signInAt)}
            </option>
          ))}
        </select>
        {fieldError(state.errors, "visitRecordId") ? (
          <p className="form-error">{fieldError(state.errors, "visitRecordId")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="taskStatus" className="text-sm font-semibold text-slate-900">
          Task Status *
        </label>
        <select
          id="taskStatus"
          name="taskStatus"
          defaultValue={TaskStatus.COMPLETE}
          required
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
        <label htmlFor="signOutNote" className="text-sm font-semibold text-slate-900">
          Note
        </label>
        <textarea id="signOutNote" name="signOutNote" rows={4} className="form-input" />
      </div>

      <div className="space-y-2">
        <label htmlFor="keyReturnTo" className="text-sm font-semibold text-slate-900">
          Key Return to *
        </label>
        <input
          id="keyReturnTo"
          name="keyReturnTo"
          placeholder="Hotel staff name"
          required
          className="form-input"
        />
        {fieldError(state.errors, "keyReturnTo") ? (
          <p className="form-error">{fieldError(state.errors, "keyReturnTo")}</p>
        ) : null}
      </div>

      <SignaturePadField
        label="Contractor Signature"
        name="contractorSignOutSignature"
        required
        error={fieldError(state.errors, "contractorSignOutSignature")}
      />

      <SignaturePadField
        label="Hotel Staff Signature"
        name="hotelStaffSignature"
        required
        error={fieldError(state.errors, "hotelStaffSignature")}
      />

      {state.message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      <SubmitButton
        label="Submit Sign Out"
        pendingLabel="Saving..."
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0f2350] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#17346f] disabled:cursor-not-allowed disabled:opacity-70"
      />
    </form>
  );
}
