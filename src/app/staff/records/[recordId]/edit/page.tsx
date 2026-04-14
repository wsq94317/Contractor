import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RecordEditorForm } from "@/components/record-editor-form";
import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { getVisitRecordForHotel } from "@/lib/data";

type PageProps = {
  params: Promise<{ recordId: string }>;
};

export default async function EditRecordPage({ params }: PageProps) {
  const session = await requireStaffSession();

  if (!isSuperAdmin(session.username)) {
    redirect("/staff/records");
  }

  const { recordId } = await params;
  const record = await getVisitRecordForHotel(recordId, session.hotelId);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#8b6914]">Edit</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">{record.visitorName}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/staff/records" className="text-sm font-semibold text-[#0f2350]">
            ← Back to records
          </Link>
          <Link href={`/staff/records/${record.id}`} className="text-sm font-semibold text-[#0f2350]">
            View detail
          </Link>
        </div>
      </div>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <RecordEditorForm
          mode="edit"
          record={{
            id: record.id,
            visitorName: record.visitorName,
            companyName: record.companyName,
            contactNumber: record.contactNumber,
            carRegistrationNumber: record.carRegistrationNumber,
            visitorType: record.visitorType,
            numberOfVisitors: record.numberOfVisitors,
            reasonDetail: record.reasonDetail,
            contractorSet: record.contractorSet,
            additionalKey: record.additionalKey,
            signInSignature: record.signInSignature,
            signInAt: record.signInAt,
            recordStatus: record.recordStatus,
            signOutAt: record.signOutAt,
            taskStatus: record.taskStatus,
            signOutNote: record.signOutNote,
            keyReturnTo: record.keyReturnTo,
            contractorSignOutSignature: record.contractorSignOutSignature,
            hotelStaffSignature: record.hotelStaffSignature,
          }}
        />
      </section>
    </div>
  );
}
