"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type SignaturePadFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  defaultValue?: string | null;
};

export function SignaturePadField({
  label,
  name,
  required,
  error,
  defaultValue,
}: SignaturePadFieldProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [value, setValue] = useState(() => defaultValue ?? "");

  useEffect(() => {
    if (defaultValue && signatureRef.current) {
      signatureRef.current.fromDataURL(defaultValue);
    }
  }, [defaultValue]);

  function syncValue() {
    const nextValue = signatureRef.current?.isEmpty()
      ? ""
      : signatureRef.current?.getTrimmedCanvas().toDataURL("image/png");

    setValue(nextValue ?? "");
  }

  function clearCanvas() {
    signatureRef.current?.clear();
    setValue("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-900">
          {label}
          {required ? " *" : ""}
        </label>
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-[#d4a62a] hover:text-[#8b6914]"
        >
          Clear
        </button>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <SignatureCanvas
          ref={signatureRef}
          onEnd={syncValue}
          penColor="#0f172a"
          backgroundColor="white"
          canvasProps={{
            width: 900,
            height: 220,
            className: "h-[220px] w-full",
          }}
        />
      </div>
      <input type="hidden" name={name} value={value} />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
