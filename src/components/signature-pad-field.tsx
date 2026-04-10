"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [value, setValue] = useState(() => defaultValue ?? "");
  const [canvasWidth, setCanvasWidth] = useState(900);

  useLayoutEffect(() => {
    function updateCanvasWidth() {
      const width = containerRef.current?.clientWidth ?? 900;
      setCanvasWidth(Math.max(320, Math.floor(width)));
    }

    updateCanvasWidth();
    window.addEventListener("resize", updateCanvasWidth);

    return () => {
      window.removeEventListener("resize", updateCanvasWidth);
    };
  }, []);

  useEffect(() => {
    if (defaultValue && signatureRef.current) {
      signatureRef.current.fromDataURL(defaultValue);
    } else if (!defaultValue && value && signatureRef.current) {
      signatureRef.current.fromDataURL(value);
    }
  }, [canvasWidth, defaultValue, value]);

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
      <div
        ref={containerRef}
        className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
      >
        <SignatureCanvas
          ref={signatureRef}
          onEnd={syncValue}
          penColor="#0f172a"
          backgroundColor="white"
          canvasProps={{
            width: canvasWidth,
            height: 220,
            className: "h-[220px] w-full touch-none select-none cursor-crosshair",
          }}
        />
      </div>
      <input type="hidden" name={name} value={value} />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
