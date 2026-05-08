"use server";

import { RecordStatus, SignInType, VisitorType } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { signInSchema, signOutSchema, type ActionState } from "@/lib/validation";

function formatErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

async function findMatchingStaffProfile(args: {
  hotelId: string;
  visitorName: string;
  contactNumber: string;
}) {
  const profiles = await prisma.staffProfile.findMany({
    where: {
      hotels: { some: { hotelId: args.hotelId } },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      position: true,
      companyName: true,
      carRegistrationNumber: true,
    },
  });

  const targetName = normalizeName(args.visitorName);
  const targetPhone = normalizePhone(args.contactNumber);

  // Prefer a name match; if multiple share the name, narrow by phone.
  const nameMatches = profiles.filter((profile) => normalizeName(profile.name) === targetName);
  if (nameMatches.length === 1) {
    return nameMatches[0];
  }
  if (nameMatches.length > 1 && targetPhone.length > 0) {
    const exact = nameMatches.find((profile) => normalizePhone(profile.phone) === targetPhone);
    if (exact) {
      return exact;
    }
  }

  // Fallback: phone-only match (for typo'd names but consistent phone).
  if (targetPhone.length >= 6) {
    const phoneMatches = profiles.filter(
      (profile) => normalizePhone(profile.phone) === targetPhone,
    );
    if (phoneMatches.length === 1) {
      return phoneMatches[0];
    }
  }

  return null;
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
    // Plan B: if the visitor's name matches a configured staff profile at this
    // hotel, treat the entry as a STAFF sign-in. This patches the HS habit of
    // signing in via the Contractor tab even when registered as staff.
    const matchedStaff = await findMatchingStaffProfile({
      hotelId: hotel.id,
      visitorName: parsed.data.visitorName,
      contactNumber: parsed.data.contactNumber,
    });

    await prisma.visitRecord.create({
      data: {
        hotelId: hotel.id,
        signInType: matchedStaff ? SignInType.STAFF : SignInType.CONTRACTOR,
        staffProfileId: matchedStaff?.id ?? null,
        visitorName: matchedStaff?.name ?? parsed.data.visitorName,
        companyName: matchedStaff?.companyName ?? parsed.data.companyName,
        contactNumber: matchedStaff?.phone ?? parsed.data.contactNumber,
        carRegistrationNumber:
          matchedStaff?.carRegistrationNumber ?? parsed.data.carRegistrationNumber,
        visitorType: matchedStaff ? VisitorType.PRE_ONBOARDED_STAFF : parsed.data.visitorType,
        numberOfVisitors: matchedStaff ? 1 : parsed.data.numberOfVisitors,
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
