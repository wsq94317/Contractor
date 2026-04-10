import Link from "next/link";

import { RecordEditorForm } from "@/components/record-editor-form";
import { requireStaffSession } from "@/lib/auth";

export default async function NewRecordPage() {
  const session = await requireStaffSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Create</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            New record for {session.hotelShortName}
          </h2>
        </div>
        <Link href="/staff/records" className="text-sm font-semibold text-[#0f2350]">
          ← Back to records
        </Link>
      </div>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <RecordEditorForm mode="create" />
      </section>
    </div>
  );
}
