import Link from "next/link";
import { notFound } from "next/navigation";

import { requireStaffSession } from "@/lib/auth";
import { getVisitRecordForHotel } from "@/lib/data";
import {
  formatDateTime,
  getRecordStatusLabel,
  getTaskStatusLabel,
  getVisitorTypeLabel,
} from "@/lib/format";

type PageProps = {
  params: Promise<{ recordId: string }>;
};

export default async function RecordDetailPage({ params }: PageProps) {
  const session = await requireStaffSession();
  const { recordId } = await params;
  const record = await getVisitRecordForHotel(recordId, session.hotelId);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Record Detail</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">{record.visitorName}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/staff/records" className="text-sm font-semibold text-[#0f2350]">
            ← Back
          </Link>
          <Link
            href={`/staff/records/${record.id}/edit`}
            className="rounded-full border border-[#0f2350] px-4 py-2 text-sm font-semibold text-[#0f2350]"
          >
            Edit
          </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Company", record.companyName],
              ["Contact Number", record.contactNumber],
              ["Car Registration", record.carRegistrationNumber || "No vehicle"],
              ["Visitor Type", getVisitorTypeLabel(record.visitorType)],
              ["Number of Visitors", String(record.numberOfVisitors)],
              ["Status", getRecordStatusLabel(record.recordStatus)],
              ["Sign In", formatDateTime(record.signInAt)],
              ["Sign Out", formatDateTime(record.signOutAt)],
              ["Task Status", getTaskStatusLabel(record.taskStatus)],
              ["Key Return to", record.keyReturnTo || "Pending"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Visit Reason</p>
              <p className="mt-2 text-sm leading-7 text-slate-900">{record.reasonDetail}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Additional Key</p>
              <p className="mt-2 text-sm leading-7 text-slate-900">
                {record.additionalKey || "Not provided"}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Contractor Set</p>
              <p className="mt-2 text-sm leading-7 text-slate-900">
                {record.contractorSet || "Not provided"}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Sign Out Note</p>
              <p className="mt-2 text-sm leading-7 text-slate-900">
                {record.signOutNote || "No note"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[
            { label: "Sign In Signature", signature: record.signInSignature },
            {
              label: "Contractor Sign Out Signature",
              signature: record.contractorSignOutSignature ?? undefined,
            },
            {
              label: "Hotel Staff Signature",
              signature: record.hotelStaffSignature ?? undefined,
            },
          ].map(({ label, signature }) => (
            <section
              key={label}
              className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
              <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                {signature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={signature} alt={label} className="h-auto w-full rounded-2xl bg-white" />
                ) : (
                  <p className="text-sm text-slate-500">Not captured yet.</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
