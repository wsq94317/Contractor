import "server-only";

import { Prisma, RecordStatus, SignInType } from "@prisma/client";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function getHotels() {
  return prisma.hotel.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getHotelBySlug(slug: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
  });

  if (!hotel) {
    notFound();
  }

  return hotel;
}

export async function getOpenVisitRecordsByHotel(hotelId: string) {
  return prisma.visitRecord.findMany({
    where: {
      hotelId,
      recordStatus: RecordStatus.OPEN,
      deletedAt: null,
    },
    orderBy: { signInAt: "desc" },
    select: {
      id: true,
      signInType: true,
      visitorName: true,
      companyName: true,
      signInAt: true,
      additionalKey: true,
    },
  });
}

type RecordFilters = {
  hotelId: string;
  q?: string;
  status?: RecordStatus | "ALL";
  visitorType?: string;
  signInType?: SignInType | "ALL";
  dateFrom?: string;
  dateTo?: string;
  sort?: RecordSort;
};

export type RecordSort =
  | "SIGN_IN_DESC"
  | "SIGN_IN_ASC"
  | "SIGN_OUT_DESC"
  | "SIGN_OUT_ASC"
  | "NAME_ASC"
  | "NAME_DESC";

function compareNullableDate(
  leftValue: Date | null,
  rightValue: Date | null,
  direction: "asc" | "desc",
) {
  if (!leftValue && !rightValue) {
    return 0;
  }

  if (!leftValue) {
    return 1;
  }

  if (!rightValue) {
    return -1;
  }

  return direction === "asc"
    ? leftValue.getTime() - rightValue.getTime()
    : rightValue.getTime() - leftValue.getTime();
}

export async function getFilteredVisitRecords(filters: RecordFilters) {
  const where: Prisma.VisitRecordWhereInput = {
    hotelId: filters.hotelId,
    deletedAt: null,
  };

  if (filters.q) {
    where.OR = [
      { visitorName: { contains: filters.q } },
      { companyName: { contains: filters.q } },
      { contactNumber: { contains: filters.q } },
      { reasonDetail: { contains: filters.q } },
      { staffProfile: { is: { name: { contains: filters.q } } } },
      { staffProfile: { is: { phone: { contains: filters.q } } } },
      { staffProfile: { is: { position: { contains: filters.q } } } },
    ];
  }

  if (filters.status && filters.status !== "ALL") {
    where.recordStatus = filters.status;
  }

  if (filters.visitorType && filters.visitorType !== "ALL") {
    where.visitorType = filters.visitorType as never;
  }

  if (filters.signInType && filters.signInType !== "ALL") {
    where.signInType = filters.signInType;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.signInAt = {};
    if (filters.dateFrom) {
      where.signInAt.gte = new Date(`${filters.dateFrom}T00:00:00`);
    }
    if (filters.dateTo) {
      where.signInAt.lte = new Date(`${filters.dateTo}T23:59:59`);
    }
  }

  const records = await prisma.visitRecord.findMany({
    where,
    orderBy: { signInAt: "desc" },
    include: {
      hotel: true,
      staffProfile: {
        include: {
          hotels: {
            include: {
              hotel: true,
            },
          },
        },
      },
    },
  });

  const sort = filters.sort ?? "SIGN_IN_DESC";

  return [...records].sort((left, right) => {
    switch (sort) {
      case "NAME_ASC":
        return left.visitorName.localeCompare(right.visitorName, "en-AU");
      case "NAME_DESC":
        return right.visitorName.localeCompare(left.visitorName, "en-AU");
      case "SIGN_IN_ASC":
        return left.signInAt.getTime() - right.signInAt.getTime();
      case "SIGN_OUT_DESC":
        return compareNullableDate(left.signOutAt, right.signOutAt, "desc");
      case "SIGN_OUT_ASC":
        return compareNullableDate(left.signOutAt, right.signOutAt, "asc");
      case "SIGN_IN_DESC":
      default:
        return right.signInAt.getTime() - left.signInAt.getTime();
    }
  });
}

export async function getVisitRecordForHotel(recordId: string, hotelId: string) {
  return prisma.visitRecord.findFirst({
    where: {
      id: recordId,
      hotelId,
      deletedAt: null,
    },
    include: {
      hotel: true,
      staffProfile: {
        include: {
          hotels: {
            include: {
              hotel: true,
            },
          },
        },
      },
    },
  });
}

export async function getStaffProfiles() {
  return prisma.staffProfile.findMany({
    orderBy: { name: "asc" },
    include: {
      hotels: {
        include: {
          hotel: true,
        },
        orderBy: {
          hotel: {
            name: "asc",
          },
        },
      },
    },
  });
}

export async function getStaffProfilesForHotel(hotelId: string) {
  return prisma.staffProfile.findMany({
    where: {
      hotels: {
        some: {
          hotelId,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      position: true,
      companyName: true,
      carRegistrationNumber: true,
    },
  });
}

export async function getStaffProfileById(staffProfileId: string) {
  return prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    include: {
      hotels: {
        include: {
          hotel: true,
        },
      },
    },
  });
}

type AttendanceFilters = {
  hotelId: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getStaffAttendanceRecords(filters: AttendanceFilters) {
  const where: Prisma.VisitRecordWhereInput = {
    hotelId: filters.hotelId,
    signInType: SignInType.STAFF,
    deletedAt: null,
  };

  if (filters.q) {
    where.OR = [
      { visitorName: { contains: filters.q } },
      { companyName: { contains: filters.q } },
      { contactNumber: { contains: filters.q } },
      { reasonDetail: { contains: filters.q } },
      { staffProfile: { is: { name: { contains: filters.q } } } },
      { staffProfile: { is: { phone: { contains: filters.q } } } },
      { staffProfile: { is: { position: { contains: filters.q } } } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.signInAt = {};
    if (filters.dateFrom) {
      where.signInAt.gte = new Date(`${filters.dateFrom}T00:00:00`);
    }
    if (filters.dateTo) {
      where.signInAt.lte = new Date(`${filters.dateTo}T23:59:59`);
    }
  }

  return prisma.visitRecord.findMany({
    where,
    orderBy: { signInAt: "desc" },
    include: {
      hotel: true,
      staffProfile: true,
    },
  });
}
