"use server";

import { RecordStatus, SignInType, VisitorType } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminRecordSchema, type ActionState } from "@/lib/validation";

function formatErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

async function parseAdminRecord(formData: FormData) {
  const parsed = adminRecordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false as const,
      state: {
        message: "Please correct the record form and submit again.",
        errors: formatErrors(parsed.error),
      },
    };
  }

  return {
    ok: true as const,
    data: parsed.data,
  };
}

function buildRecordPayload(data: NonNullable<Awaited<ReturnType<typeof parseAdminRecord>>["data"]>) {
  const signInType =
    data.visitorType === VisitorType.HOTEL_STAFF ? SignInType.STAFF : data.signInType;

  return {
    signInType,
    visitorName: data.visitorName,
    companyName: data.companyName,
    contactNumber: data.contactNumber,
    carRegistrationNumber: data.carRegistrationNumber,
    visitorType: data.visitorType,
    numberOfVisitors: data.numberOfVisitors,
    reasonDetail: data.reasonDetail,
    contractorSet: data.contractorSet,
    additionalKey: data.additionalKey,
    signInSignature: data.signInSignature,
    signInAt: new Date(data.signInAt),
    recordStatus: data.recordStatus,
    signOutAt:
      data.recordStatus === RecordStatus.CLOSED && data.signOutAt
        ? new Date(data.signOutAt)
        : null,
    taskStatus: data.recordStatus === RecordStatus.CLOSED ? data.taskStatus ?? null : null,
    signOutNote: data.recordStatus === RecordStatus.CLOSED ? data.signOutNote : null,
    keyReturnTo: data.recordStatus === RecordStatus.CLOSED ? data.keyReturnTo : null,
    contractorSignOutSignature:
      data.recordStatus === RecordStatus.CLOSED ? data.contractorSignOutSignature : null,
    hotelStaffSignature:
      data.recordStatus === RecordStatus.CLOSED ? data.hotelStaffSignature : null,
  };
}

export async function createAdminRecord(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireStaffSession();
  const parsed = await parseAdminRecord(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  await prisma.visitRecord.create({
    data: {
      hotelId: session.hotelId,
      ...buildRecordPayload(parsed.data),
    },
  });

  revalidatePath("/staff/records");
  redirect("/staff/records?created=1");
}

export async function updateAdminRecord(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireStaffSession();

  if (!isSuperAdmin(session.username)) {
    redirect("/staff/records");
  }

  const recordId = String(formData.get("recordId") ?? "");

  if (!recordId) {
    return { message: "Record id is missing." };
  }

  const existingRecord = await prisma.visitRecord.findFirst({
    where: {
      id: recordId,
      hotelId: session.hotelId,
      deletedAt: null,
    },
  });

  if (!existingRecord) {
    notFound();
  }

  const parsed = await parseAdminRecord(formData);
  if (!parsed.ok) {
    return parsed.state;
  }

  await prisma.visitRecord.update({
    where: { id: existingRecord.id },
    data: buildRecordPayload(parsed.data),
  });

  revalidatePath("/staff/records");
  revalidatePath(`/staff/records/${existingRecord.id}`);
  redirect(`/staff/records/${existingRecord.id}?updated=1`);
}

export async function softDeleteRecord(recordId: string) {
  const session = await requireStaffSession();

  if (!isSuperAdmin(session.username)) {
    redirect("/staff/records");
  }

  const record = await prisma.visitRecord.findFirst({
    where: {
      id: recordId,
      hotelId: session.hotelId,
      deletedAt: null,
    },
  });

  if (!record) {
    notFound();
  }

  await prisma.visitRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/staff/records");
  redirect("/staff/records?deleted=1");
}
