"use server";

import { redirect } from "next/navigation";

import { authenticateHotelUser, requireStaffSession } from "@/lib/auth";
import { clearSession } from "@/lib/session";
import { loginSchema, type ActionState } from "@/lib/validation";

function formatErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function loginHotelStaff(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: "Please enter username and password.",
      errors: formatErrors(parsed.error),
    };
  }

  const user = await authenticateHotelUser(
    parsed.data.hotelSlug,
    parsed.data.username,
    parsed.data.password,
  );

  if (!user) {
    return {
      message: "Invalid username or password for this hotel.",
    };
  }

  redirect("/staff/records");
}

export async function logoutStaff() {
  await requireStaffSession();
  await clearSession();
  redirect("/");
}
