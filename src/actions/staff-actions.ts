"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isSuperAdmin, requireStaffSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { staffProfileSchema, type ActionState } from "@/lib/validation";

function formatErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

async function revalidateStaffSurfaces() {
  const hotels = await prisma.hotel.findMany({
    select: { slug: true },
  });

  revalidatePath("/staff/staff");

  for (const hotel of hotels) {
    revalidatePath(`/hotels/${hotel.slug}/sign-in`);
  }
}

async function parseStaffProfile(formData: FormData) {
  const parsed = staffProfileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    position: String(formData.get("position") ?? ""),
    hotelIds: formData.getAll("hotelIds").map(String),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      state: {
        message: "Please correct the staff form and submit again.",
        errors: formatErrors(parsed.error),
      },
    };
  }

  return {
    ok: true as const,
    data: parsed.data,
  };
}

export async function createStaffProfile(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireStaffSession();

  const parsed = await parseStaffProfile(formData);
  if (!parsed.ok) {
    return parsed.state;
  }

  await prisma.staffProfile.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      position: parsed.data.position,
      hotels: {
        create: parsed.data.hotelIds.map((hotelId) => ({
          hotelId,
        })),
      },
    },
  });

  await revalidateStaffSurfaces();
  redirect("/staff/staff?created=1");
}

export async function updateStaffProfile(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireStaffSession();

  const staffProfileId = String(formData.get("staffProfileId") ?? "");
  if (!staffProfileId) {
    return { message: "Staff profile id is missing." };
  }

  const existingStaffProfile = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
  });

  if (!existingStaffProfile) {
    notFound();
  }

  const parsed = await parseStaffProfile(formData);
  if (!parsed.ok) {
    return parsed.state;
  }

  await prisma.staffProfile.update({
    where: { id: existingStaffProfile.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      position: parsed.data.position,
      hotels: {
        deleteMany: {},
        create: parsed.data.hotelIds.map((hotelId) => ({
          hotelId,
        })),
      },
    },
  });

  await revalidateStaffSurfaces();
  redirect("/staff/staff?updated=1");
}

export async function deleteStaffProfile(staffProfileId: string) {
  const session = await requireStaffSession();

  if (!isSuperAdmin(session.username)) {
    redirect("/staff/staff");
  }

  const existingStaffProfile = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
  });

  if (!existingStaffProfile) {
    notFound();
  }

  await prisma.staffProfile.delete({
    where: { id: staffProfileId },
  });

  await revalidateStaffSurfaces();
  redirect("/staff/staff?deleted=1");
}
