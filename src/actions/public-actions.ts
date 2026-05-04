"use server";

import { RecordStatus, SignInType, VisitorType } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { signInSchema, signOutSchema, type ActionState } from "@/lib/validation";

function formatErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function submitSignIn(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: "Please correct the sign in form and submit again.",
      errors: formatErrors(parsed.error),
    };
  }

  const hotel = await prisma.hotel.findUnique({
    where: { slug: parsed.data.hotelSlug },
  });

  if (!hotel) {
    return { message: "Hotel not found." };
  }

  if (parsed.data.signInType === SignInType.CONTRACTOR) {
    await prisma.visitRecord.create({
      data: {
        hotelId: hotel.id,
        signInType: SignInType.CONTRACTOR,
        visitorName: parsed.data.visitorName,
        companyName: parsed.data.companyName,
        contactNumber: parsed.data.contactNumber,
        carRegistrationNumber: parsed.data.carRegistrationNumber,
        visitorType: parsed.data.visitorType,
        numberOfVisitors: parsed.data.numberOfVisitors,
        reasonDetail: parsed.data.reasonDetail,
        contractorSet: parsed.data.contractorSet,
        additionalKey: parsed.data.additionalKey,
        signInSignature: parsed.data.signInSignature,
        signInAt: new Date(),
        recordStatus: RecordStatus.OPEN,
      },
    });
  } else {
    const staffProfile = await prisma.staffProfile.findFirst({
      where: {
        id: parsed.data.staffProfileId,
        hotels: {
          some: {
            hotelId: hotel.id,
          },
        },
      },
    });

    if (!staffProfile) {
      return { message: "Selected staff member is not available for this hotel." };
    }

    await prisma.visitRecord.create({
      data: {
        hotelId: hotel.id,
        signInType: SignInType.STAFF,
        staffProfileId: staffProfile.id,
        visitorName: staffProfile.name,
        companyName: staffProfile.companyName,
        contactNumber: staffProfile.phone,
        visitorType: VisitorType.PRE_ONBOARDED_STAFF,
        numberOfVisitors: 1,
        reasonDetail: parsed.data.reasonDetail,
        contractorSet: parsed.data.contractorSet,
        additionalKey: parsed.data.additionalKey,
        carRegistrationNumber: staffProfile.carRegistrationNumber,
        signInSignature: parsed.data.signInSignature,
        signInAt: new Date(),
        recordStatus: RecordStatus.OPEN,
      },
    });
  }

  revalidatePath(`/hotels/${hotel.slug}/sign-out`);
  revalidatePath("/staff/records");
  revalidatePath("/staff/attendance");
  redirect(`/hotels/${hotel.slug}?signedIn=1`);
}

export async function submitSignOut(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signOutSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: "Please correct the sign out form and submit again.",
      errors: formatErrors(parsed.error),
    };
  }

  const hotel = await prisma.hotel.findUnique({
    where: { slug: parsed.data.hotelSlug },
  });

  if (!hotel) {
    return { message: "Hotel not found." };
  }

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const openRecord = await prisma.visitRecord.findFirst({
    where: {
      id: parsed.data.visitRecordId,
      hotelId: hotel.id,
      recordStatus: RecordStatus.OPEN,
      deletedAt: null,
      signInAt: {
        gte: twoDaysAgo,
      },
    },
  });

  if (!openRecord) {
    return {
      message: "This visitor record is no longer available for sign out.",
    };
  }

  await prisma.visitRecord.update({
    where: { id: openRecord.id },
    data: {
      signOutAt: new Date(),
      taskStatus: parsed.data.taskStatus,
      signOutNote: parsed.data.signOutNote,
      keyReturnTo: parsed.data.keyReturnTo,
      contractorSignOutSignature: parsed.data.contractorSignOutSignature,
      hotelStaffSignature: parsed.data.hotelStaffSignature,
      recordStatus: RecordStatus.CLOSED,
    },
  });

  revalidatePath(`/hotels/${hotel.slug}/sign-out`);
  revalidatePath("/staff/records");
  revalidatePath("/staff/attendance");
  redirect(`/hotels/${hotel.slug}?signedOut=1`);
}
