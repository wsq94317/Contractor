"use client";

import { useActionState } from "react";

import { loginHotelStaff } from "@/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/validation";

type HotelLoginFormProps = {
  hotelSlug: string;
};

const initialState: ActionState = {};

function fieldError(errors: ActionState["errors"], name: string) {
  return errors?.[name]?.[0];
}

export function HotelLoginForm({ hotelSlug }: HotelLoginFormProps) {
  const [state, formAction] = useActionState(loginHotelStaff, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="hotelSlug" value={hotelSlug} />

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-semibold text-slate-900">
          Staff Email
        </label>
        <input
          id="username"
          name="username"
          type="email"
          required
          className="form-input"
          autoComplete="username"
        />
        {fieldError(state.errors, "username") ? (
          <p className="form-error">{fieldError(state.errors, "username")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="form-input"
          autoComplete="current-password"
        />
        {fieldError(state.errors, "password") ? (
          <p className="form-error">{fieldError(state.errors, "password")}</p>
        ) : null}
      </div>

      {state.message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      <SubmitButton
        label="Staff Log In"
        pendingLabel="Checking..."
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0f2350] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#17346f] disabled:cursor-not-allowed disabled:opacity-70"
      />
    </form>
  );
}
