-- Redefine tables to add new enums/relations for staff attendance support
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "StaffProfileHotel" (
    "staffProfileId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    PRIMARY KEY ("staffProfileId", "hotelId"),
    CONSTRAINT "StaffProfileHotel_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "StaffProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffProfileHotel_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "new_VisitRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "signInType" TEXT NOT NULL DEFAULT 'CONTRACTOR',
    "staffProfileId" TEXT,
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
    CONSTRAINT "VisitRecord_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VisitRecord_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "StaffProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_VisitRecord" (
    "id",
    "hotelId",
    "signInType",
    "visitorName",
    "companyName",
    "contactNumber",
    "carRegistrationNumber",
    "visitorType",
    "numberOfVisitors",
    "reasonDetail",
    "contractorSet",
    "additionalKey",
    "signInSignature",
    "signInAt",
    "signOutAt",
    "taskStatus",
    "signOutNote",
    "keyReturnTo",
    "contractorSignOutSignature",
    "hotelStaffSignature",
    "recordStatus",
    "deletedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "hotelId",
    'CONTRACTOR',
    "visitorName",
    "companyName",
    "contactNumber",
    "carRegistrationNumber",
    "visitorType",
    "numberOfVisitors",
    "reasonDetail",
    "contractorSet",
    "additionalKey",
    "signInSignature",
    "signInAt",
    "signOutAt",
    "taskStatus",
    "signOutNote",
    "keyReturnTo",
    "contractorSignOutSignature",
    "hotelStaffSignature",
    "recordStatus",
    "deletedAt",
    "createdAt",
    "updatedAt"
FROM "VisitRecord";

DROP TABLE "VisitRecord";
ALTER TABLE "new_VisitRecord" RENAME TO "VisitRecord";

CREATE INDEX "VisitRecord_hotelId_visitorName_idx" ON "VisitRecord"("hotelId", "visitorName");
CREATE INDEX "VisitRecord_hotelId_recordStatus_idx" ON "VisitRecord"("hotelId", "recordStatus");
CREATE INDEX "VisitRecord_hotelId_signInAt_idx" ON "VisitRecord"("hotelId", "signInAt");
CREATE INDEX "VisitRecord_hotelId_signInType_signInAt_idx" ON "VisitRecord"("hotelId", "signInType", "signInAt");
CREATE INDEX "VisitRecord_staffProfileId_signInAt_idx" ON "VisitRecord"("staffProfileId", "signInAt");
CREATE INDEX "StaffProfile_name_idx" ON "StaffProfile"("name");
CREATE INDEX "StaffProfileHotel_hotelId_idx" ON "StaffProfileHotel"("hotelId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
