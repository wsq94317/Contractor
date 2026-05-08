"use client";

import { useCallback } from "react";

type Props = {
  /** id of the container whose child <details> elements will be toggled. */
  targetId: string;
};

export function AttendanceExpandToggle({ targetId }: Props) {
  const setAll = useCallback(
    (open: boolean) => {
      const container = document.getElementById(targetId);
      if (!container) return;
      const items = container.querySelectorAll<HTMLDetailsElement>("details[data-week-card]");
      items.forEach((item) => {
        item.open = open;
      });
    },
    [targetId],
  );

  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setAll(true)}
        className="rounded-full px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-[#0f2350]"
      >
        Expand all
      </button>
      <button
        type="button"
        onClick={() => setAll(false)}
        className="rounded-full px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-[#0f2350]"
      >
        Collapse all
      </button>
    </div>
  );
}
