"use client";

import { VisitorType } from "@prisma/client";
import { useActionState, useRef, useState, type FormEvent } from "react";

import { submitSignIn } from "@/actions/public-actions";
import { SignaturePadField } from "@/components/signature-pad-field";
import { SubmitButton } from "@/components/submit-button";
import { visitorTypeOptions } from "@/lib/constants";
import type { ActionState } from "@/lib/validation";

type SignInFormProps = {
  hotelSlug: string;
};

const initialState: ActionState = {};

const acknowledgmentItems = [
  {
    title: "1. Fire Doors and Restricted Access Areas",
    lines: [
      "All fire doors and entrances to any facilities/plant rooms must remain closed at all times.",
      "Under no circumstances should fire doors or restricted access doors be left ajar or propped open.",
    ],
  },
  {
    title: "2. Unauthorized Entry Prevention",
    lines: [
      "Contractors must ensure that no unauthorized individuals follow them to enter restricted areas or facilities/plant rooms.",
      "It is your responsibility to be vigilant and prevent tailgating.",
    ],
  },
  {
    title: "3. Access Card and Key Security",
    lines: [
      "All access cards and keys provided to contractors must be kept secure at all times during the job.",
      "You are solely responsible for the safekeeping of these items and must return them immediately upon completion of your work or at the request of YEHS Hotels management.",
    ],
  },
];

function fieldError(errors: ActionState["errors"], name: string) {
  return errors?.[name]?.[0];
}

export function SignInForm({ hotelSlug }: SignInFormProps) {
  const [state, formAction] = useActionState(submitSignIn, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const acknowledgedRef = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (acknowledgedRef.current) {
      return;
    }

    event.preventDefault();
    setIsModalOpen(true);
  }

  function handleAcknowledge() {
    acknowledgedRef.current = true;
    setIsModalOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="hotelSlug" value={hotelSlug} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="visitorName" className="text-sm font-semibold text-slate-900">
              Visitor Name *
            </label>
            <input id="visitorName" name="visitorName" required className="form-input" />
            {fieldError(state.errors, "visitorName") ? (
              <p className="form-error">{fieldError(state.errors, "visitorName")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-semibold text-slate-900">
              Company Name *
            </label>
            <input id="companyName" name="companyName" required className="form-input" />
            {fieldError(state.errors, "companyName") ? (
              <p className="form-error">{fieldError(state.errors, "companyName")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="contactNumber" className="text-sm font-semibold text-slate-900">
              Contact Number *
            </label>
            <input id="contactNumber" name="contactNumber" required className="form-input" />
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
            <input id="carRegistrationNumber" name="carRegistrationNumber" className="form-input" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="visitorType" className="text-sm font-semibold text-slate-900">
              Visitor Type *
            </label>
            <select
              id="visitorType"
              name="visitorType"
              defaultValue={VisitorType.CONTRACTOR}
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
              defaultValue="1"
              required
              className="form-input"
            />
            {fieldError(state.errors, "numberOfVisitors") ? (
              <p className="form-error">{fieldError(state.errors, "numberOfVisitors")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="contractorSet" className="text-sm font-semibold text-slate-900">
              Contractor Key Set
            </label>
            <input id="contractorSet" name="contractorSet" className="form-input" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="reasonDetail" className="text-sm font-semibold text-slate-900">
            Reason/Detail of the Visit *
          </label>
          <textarea id="reasonDetail" name="reasonDetail" required rows={4} className="form-input" />
          {fieldError(state.errors, "reasonDetail") ? (
            <p className="form-error">{fieldError(state.errors, "reasonDetail")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="additionalKey" className="text-sm font-semibold text-slate-900">
            Additional Key
          </label>
          <input id="additionalKey" name="additionalKey" className="form-input" />
        </div>

        <SignaturePadField
          label="Signature"
          name="signInSignature"
          required
          error={fieldError(state.errors, "signInSignature")}
        />

        {state.message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.message}
          </div>
        ) : null}

        <SubmitButton
          label="Submit Sign In"
          pendingLabel="Saving..."
          className="inline-flex w-full items-center justify-center rounded-full bg-[#0f2350] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#17346f] disabled:cursor-not-allowed disabled:opacity-70"
        />
      </form>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.3)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8b6914]">
                Safety Acknowledgment
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Fire Doors, Restricted Area Access, and Key/Access Card Security
              </h2>
            </div>

            <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6 text-sm leading-7 text-slate-700">
              <p>
                As a contractor engaged by YEHS Hotels, you are required to adhere to the
                following safety and security protocols during your work on our premises. Your
                acknowledgment and compliance are critical to maintaining the safety, security, and
                proper functioning of our facilities.
              </p>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-950">Contractor Responsibilities</h3>
                {acknowledgmentItems.map((item) => (
                  <div key={item.title} className="space-y-2 rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    {item.lines.map((line) => (
                      <p key={line}>- {line}</p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-[#d4a62a]/35 bg-[#fffaf0] p-4">
                <h3 className="text-base font-semibold text-slate-950">Acknowledgment</h3>
                <p>
                  By signing in with Yehs Hotel, you acknowledge that:
                </p>
                <p>• You have read, understood, and agree to comply with the above responsibilities.</p>
                <p>
                  • Any breach of these responsibilities may result in the termination of your
                  contract and/or liability for any damages or losses caused.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAcknowledge}
                className="rounded-full bg-[#0f2350] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17346f]"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
