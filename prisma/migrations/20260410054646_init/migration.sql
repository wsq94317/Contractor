-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroNote" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisitRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "carRegistrationNumber" TEXT,
    "visitorType" TEXT NOT NULL,
    "numberOfVisitors" INTEGER NOT NULL,
    "reasonDetail" TEXT NOT NULL,
    "contractorSet" TEXT,
    "additionalKey" TEXT,
    "signInSignature" TEXT NOT NULL,
    "signInAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signOutAt" DATETIME,
    "taskStatus" TEXT,
    "signOutNote" TEXT,
    "keyReturnTo" TEXT,
    "contractorSignOutSignature" TEXT,
    "hotelStaffSignature" TEXT,
    "recordStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VisitRecord_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_code_key" ON "Hotel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_hotelId_username_key" ON "User"("hotelId", "username");

-- CreateIndex
CREATE INDEX "VisitRecord_hotelId_visitorName_idx" ON "VisitRecord"("hotelId", "visitorName");

-- CreateIndex
CREATE INDEX "VisitRecord_hotelId_recordStatus_idx" ON "VisitRecord"("hotelId", "recordStatus");

-- CreateIndex
CREATE INDEX "VisitRecord_hotelId_signInAt_idx" ON "VisitRecord"("hotelId", "signInAt");
