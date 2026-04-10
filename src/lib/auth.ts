import "server-only";

import bcrypt from "bcryptjs";
import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { clearSession, getSession, setSession } from "@/lib/session";

export const requireStaffSession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { hotel: true },
  });

  if (!user || !user.isActive) {
    await clearSession();
    redirect("/");
  }

  return {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    hotelId: user.hotelId,
    hotelCode: user.hotel.code,
    hotelSlug: user.hotel.slug,
    hotelName: user.hotel.name,
    hotelShortName: user.hotel.shortName,
  };
});

export async function authenticateHotelUser(hotelSlug: string, username: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
      hotel: { slug: hotelSlug },
      isActive: true,
    },
    include: { hotel: true },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  await setSession({
    userId: user.id,
    hotelId: user.hotelId,
    hotelCode: user.hotel.code,
    hotelSlug: user.hotel.slug,
    name: user.name,
    username: user.username,
    role: user.role,
  });

  return user;
}
