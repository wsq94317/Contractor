import "server-only";

import { Prisma, RecordStatus } from "@prisma/client";
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
  dateFrom?: string;
  dateTo?: string;
};

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
    ];
  }

  if (filters.status && filters.status !== "ALL") {
    where.recordStatus = filters.status;
  }

  if (filters.visitorType && filters.visitorType !== "ALL") {
    where.visitorType = filters.visitorType as never;
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
    },
  });
}

export async function getVisitRecordForHotel(recordId: string, hotelId: string) {
  return prisma.visitRecord.findFirst({
    where: {
      id: recordId,
      hotelId,
      deletedAt: null,
    },
    include: { hotel: true },
  });
}
