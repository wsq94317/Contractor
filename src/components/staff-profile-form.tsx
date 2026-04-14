"use client";

import { useActionState } from "react";

import { createStaffProfile, updateStaffProfile } from "@/actions/staff-actions";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/validation";

type StaffProfileFormProps = {
  hotels: Array<{
    id: string;
    code: string;
    shortName: string;
  }>;
  staffProfile?: {
    id: string;
    name: string;
    phone: string;
    position: string;
    companyName: string;
    carRegistrationNumber: string | null;
    hotelIds: string[];
  };
};

const initialState: ActionState = {};

function fieldError(errors: ActionState["errors"], name: string) {
  return errors?.[name]?.[0];
}

export function StaffProfileForm({ hotels, staffProfile }: StaffProfileFormProps) {
  const action = staffProfile ? updateStaffProfile : createStaffProfile;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {staffProfile ? <input type="hidden" name="staffProfileId" value={staffProfile.id} /> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-900">
            Name *
          </label>
          <input
            id="name"
            name="name"
            defaultValue={staffProfile?.name ?? ""}
            required
            className="form-input"
          />
          {fieldError(state.errors, "name") ? (
            <p className="form-error">{fieldError(state.errors, "name")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-900">
            Phone *
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={staffProfile?.phone ?? ""}
            required
            className="form-input"
          />
          {fieldError(state.errors, "phone") ? (
            <p className="form-error">{fieldError(state.errors, "phone")}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="position" className="text-sm font-semibold text-slate-900">
            Position *
          </label>
          <input
            id="position"
            name="position"
            defaultValue={staffProfile?.position ?? ""}
            required
            className="form-input"
          />
          {fieldError(state.errors, "position") ? (
            <p className="form-error">{fieldError(state.errors, "position")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="companyName" className="text-sm font-semibold text-slate-900">
            Company Name *
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={staffProfile?.companyName ?? "YEHS Hotel"}
            required
            className="form-input"
          />
          {fieldError(state.errors, "companyName") ? (
            <p className="form-error">{fieldError(state.errors, "companyName")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="carRegistrationNumber" className="text-sm font-semibold text-slate-900">
            Car Rego
          </label>
          <input
            id="carRegistrationNumber"
            name="carRegistrationNumber"
            defaultValue={staffProfile?.carRegistrationNumber ?? ""}
            className="form-input"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">Hotels *</p>
          <p className="mt-1 text-sm text-slate-500">
            Assign one or more properties where this staff member can sign in.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {hotels.map((hotel) => (
            <label
              key={hotel.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
            >
              <input
                type="checkbox"
                name="hotelIds"
                value={hotel.id}
                defaultChecked={staffProfile?.hotelIds.includes(hotel.id)}
                className="h-4 w-4 rounded border-slate-300 text-[#0f2350] focus:ring-[#0f2350]"
              />
              <span>
                {hotel.shortName} <span className="text-slate-500">({hotel.code})</span>
              </span>
            </label>
          ))}
        </div>
        {fieldError(state.errors, "hotelIds") ? (
          <p className="form-error">{fieldError(state.errors, "hotelIds")}</p>
        ) : null}
      </div>

      {state.message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      <SubmitButton
        label={staffProfile ? "Save Staff" : "Add Staff"}
        pendingLabel="Saving..."
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0f2350] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#17346f] disabled:cursor-not-allowed disabled:opacity-70"
      />
    </form>
  );
}
