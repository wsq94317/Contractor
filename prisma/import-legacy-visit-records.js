/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const {
  PrismaClient,
  RecordStatus,
  SignInType,
  TaskStatus,
  VisitorType,
} = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_FILE = "Contractor_Visitor_Temporary_Access_Log_SQVB.csv";
const DEFAULT_HOTEL_CODE = "SQVB";
const APP_TIME_ZONE = "Australia/Sydney";
const DEFAULT_FORCED_STAFF_NAMES = ["katherine", "davin", "kelly"];

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function normalizeCell(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n").trim();
}

function stripWrappingQuotes(value) {
  let normalized = normalizeCell(value);

  while (normalized.startsWith('"') && normalized.endsWith('"') && normalized.length >= 2) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function normalizeText(value) {
  return normalizeCell(value).replace(/\s+/g, " ");
}

function normalizeSignature(value) {
  const normalized = stripWrappingQuotes(value);

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("data:image/")) {
    return normalized;
  }

  return `data:image/png;base64,${normalized.replace(/\s+/g, "")}`;
}

function parseOffsetMinutes(offsetLabel) {
  const match = offsetLabel.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);

  if (!match) {
    throw new Error(`Unsupported time zone offset: ${offsetLabel}`);
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number.parseInt(match[2], 10);
  const minutes = Number.parseInt(match[3] ?? "0", 10);

  return sign * (hours * 60 + minutes);
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "shortOffset",
  });

  const offsetLabel = formatter.formatToParts(date).find((part) => part.type === "timeZoneName")?.value;

  if (!offsetLabel) {
    throw new Error(`Unable to resolve time zone offset for ${timeZone}`);
  }

  return parseOffsetMinutes(offsetLabel);
}

function zonedDateTimeToUtc(year, month, day, hour, minute, timeZone) {
  const baseUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = new Date(baseUtc);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offsetMinutes = getTimeZoneOffsetMinutes(candidate, timeZone);
    const nextCandidate = new Date(baseUtc - offsetMinutes * 60_000);

    if (nextCandidate.getTime() === candidate.getTime()) {
      return nextCandidate;
    }

    candidate = nextCandidate;
  }

  return candidate;
}

function parseLegacyDateTime(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const match = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i
  );

  if (!match) {
    throw new Error(`Unsupported date/time format: ${normalized}`);
  }

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);
  let hour = Number.parseInt(match[4], 10);
  const minute = Number.parseInt(match[5], 10);
  const meridiem = match[6].toUpperCase();

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  } else if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  return zonedDateTimeToUtc(year, month, day, hour, minute, APP_TIME_ZONE);
}

function mapVisitorType(value, warnings) {
  const normalized = normalizeText(value).toLowerCase();

  if (!normalized) {
    warnings.blankVisitorType += 1;
    return VisitorType.CONTRACTOR;
  }

  if (normalized.includes("pre-onboarded")) {
    return VisitorType.PRE_ONBOARDED_STAFF;
  }

  if (normalized.includes("contractor")) {
    return VisitorType.CONTRACTOR;
  }

  if (normalized.includes("auditor") || normalized.includes("inspector")) {
    return VisitorType.AUDITOR_INSPECTOR;
  }

  warnings.unknownVisitorType.push(value);
  return VisitorType.CONTRACTOR;
}

function mapTaskStatus(value, warnings) {
  const normalized = normalizeText(value).toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === "complete") {
    return TaskStatus.COMPLETE;
  }

  if (normalized === "on going" || normalized === "ongoing") {
    return TaskStatus.ON_GOING;
  }

  if (normalized === "deferred") {
    return TaskStatus.DEFERRED;
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return TaskStatus.CANCELLED;
  }

  warnings.unknownTaskStatus.push(value);
  return TaskStatus.OTHER;
}

function normalizeNameKey(value) {
  return normalizeText(value).toLowerCase();
}

function shouldForceStaff(visitorName, forcedStaffNames) {
  const normalizedName = normalizeNameKey(visitorName);

  if (!normalizedName) {
    return false;
  }

  return forcedStaffNames.some((name) => normalizedName === name || normalizedName.startsWith(`${name} `));
}

function inferSignInType(visitorType) {
  return visitorType === VisitorType.PRE_ONBOARDED_STAFF || visitorType === VisitorType.HOTEL_STAFF
    ? SignInType.STAFF
    : SignInType.CONTRACTOR;
}

function normalizeCompanyName(value, visitorType, warnings) {
  const normalized = normalizeText(value);

  if (normalized) {
    return normalized;
  }

  warnings.blankCompanyName += 1;
  return visitorType === VisitorType.PRE_ONBOARDED_STAFF ? "YEHS Hotel" : "Unknown";
}

function normalizeRequiredText(value, fallback, warningKey, warnings) {
  const normalized = normalizeText(value);

  if (normalized) {
    return normalized;
  }

  warnings[warningKey] += 1;
  return fallback;
}

function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeNumberOfVisitors(value, warnings) {
  const normalized = normalizeText(value);
  const parsed = Number.parseInt(normalized, 10);

  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }

  warnings.invalidNumberOfVisitors += 1;
  return 1;
}

function buildExistingRecordKey(record) {
  return [
    record.hotelId,
    normalizeText(record.visitorName).toLowerCase(),
    normalizeText(record.companyName).toLowerCase(),
    normalizeText(record.contactNumber).toLowerCase(),
    normalizeText(record.reasonDetail).toLowerCase(),
    record.signInAt.toISOString(),
    record.signOutAt?.toISOString() ?? "",
  ].join("|");
}

async function main() {
  const csvPath = path.resolve(process.cwd(), process.env.LEGACY_IMPORT_FILE ?? DEFAULT_FILE);
  const hotelCode = normalizeText(process.env.LEGACY_IMPORT_HOTEL_CODE ?? DEFAULT_HOTEL_CODE).toUpperCase();
  const applyImport = process.env.APPLY_LEGACY_IMPORT === "true";
  const forcedStaffNames = new Set(
    (process.env.LEGACY_IMPORT_FORCE_STAFF_NAMES
      ? process.env.LEGACY_IMPORT_FORCE_STAFF_NAMES.split(",")
      : DEFAULT_FORCED_STAFF_NAMES
    )
      .map((value) => normalizeNameKey(value))
      .filter(Boolean)
  );

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const hotel = await prisma.hotel.findUnique({
    where: { code: hotelCode },
    select: { id: true, code: true, name: true },
  });

  if (!hotel) {
    throw new Error(`Hotel not found for code: ${hotelCode}`);
  }

  const existingRecords = await prisma.visitRecord.findMany({
    where: {
      hotelId: hotel.id,
      deletedAt: null,
    },
    select: {
      hotelId: true,
      visitorName: true,
      companyName: true,
      contactNumber: true,
      reasonDetail: true,
      signInAt: true,
      signOutAt: true,
    },
  });

  const existingKeys = new Set(existingRecords.map(buildExistingRecordKey));

  const rawContent = stripBom(fs.readFileSync(csvPath, "utf8"));
  const [headerRow, ...dataRows] = parseCsv(rawContent).filter((row) =>
    row.some((value) => normalizeCell(value).length > 0)
  );

  if (!headerRow) {
    throw new Error("CSV file is empty.");
  }

  const headers = headerRow.map((value) => normalizeCell(value));
  const warnings = {
    blankVisitorName: 0,
    blankVisitorType: 0,
    blankCompanyName: 0,
    blankContactNumber: 0,
    blankReasonDetail: 0,
    invalidNumberOfVisitors: 0,
    forcedStaffRows: 0,
    negativeDurationRows: [],
    unknownVisitorType: [],
    unknownTaskStatus: [],
  };

  const createInputs = [];
  let duplicateCount = 0;

  for (const [index, rowValues] of dataRows.entries()) {
    const rowNumber = index + 2;
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, rowValues[headerIndex] ?? ""]));

    const forceStaff = shouldForceStaff(row.VisitorName, [...forcedStaffNames]);
    const visitorType = forceStaff
      ? VisitorType.PRE_ONBOARDED_STAFF
      : mapVisitorType(row.VisitorType, warnings);
    const signInAt = parseLegacyDateTime(row.SignInTime);

    if (!signInAt) {
      throw new Error(`Row ${rowNumber} is missing SignInTime.`);
    }

    const signOutAt = parseLegacyDateTime(row.SignOutTime);

    if (signOutAt && signOutAt.getTime() < signInAt.getTime()) {
      warnings.negativeDurationRows.push({
        rowNumber,
        visitorName: normalizeText(row.VisitorName) || "(blank)",
        signInTime: normalizeText(row.SignInTime),
        signOutTime: normalizeText(row.SignOutTime),
      });
    }

    const signInSignature = normalizeSignature(row.SignInSignature);

    if (!signInSignature) {
      throw new Error(`Row ${rowNumber} is missing SignInSignature.`);
    }

    if (forceStaff) {
      warnings.forcedStaffRows += 1;
    }

    const data = {
      hotelId: hotel.id,
      signInType: inferSignInType(visitorType),
      visitorName: normalizeRequiredText(row.VisitorName, "Unknown Visitor", "blankVisitorName", warnings),
      companyName: normalizeCompanyName(row.Company, visitorType, warnings),
      contactNumber: normalizeRequiredText(row.ContactNumber, "Unknown", "blankContactNumber", warnings),
      carRegistrationNumber: normalizeOptionalText(row.CarRegisterNumber),
      visitorType,
      numberOfVisitors: normalizeNumberOfVisitors(row.NumberOfVisitor, warnings),
      reasonDetail: normalizeRequiredText(
        row.VisitReason,
        "Imported legacy visit record",
        "blankReasonDetail",
        warnings
      ),
      contractorSet: normalizeOptionalText(row.KeyNumber),
      additionalKey: normalizeOptionalText(row.AdditionalKey),
      signInSignature,
      signInAt,
      signOutAt,
      taskStatus: mapTaskStatus(row.TaskStatus, warnings),
      signOutNote: normalizeOptionalText(row.CheckOutNote),
      keyReturnTo: normalizeOptionalText(row.KeyReturnTo),
      contractorSignOutSignature: normalizeSignature(row.SignOutSignature),
      hotelStaffSignature: normalizeSignature(row.StaffSignature),
      recordStatus: signOutAt ? RecordStatus.CLOSED : RecordStatus.OPEN,
    };

    const existingKey = buildExistingRecordKey(data);

    if (existingKeys.has(existingKey)) {
      duplicateCount += 1;
      continue;
    }

    existingKeys.add(existingKey);
    createInputs.push(data);
  }

  console.log(`Legacy import file: ${csvPath}`);
  console.log(`Target hotel: ${hotel.name} (${hotel.code})`);
  console.log(`Rows parsed: ${dataRows.length}`);
  console.log(`New records ready: ${createInputs.length}`);
  console.log(`Skipped as duplicates: ${duplicateCount}`);
  console.log(`Warnings:`);
  console.log(`  Blank visitor name -> fallback applied: ${warnings.blankVisitorName}`);
  console.log(`  Blank visitor type -> defaulted to Contractor: ${warnings.blankVisitorType}`);
  console.log(
    `  Forced to Staff by visitor name (${[...forcedStaffNames].join(", ")}): ${warnings.forcedStaffRows}`
  );
  console.log(`  Blank company name -> fallback applied: ${warnings.blankCompanyName}`);
  console.log(`  Blank contact number -> fallback applied: ${warnings.blankContactNumber}`);
  console.log(`  Blank visit reason -> fallback applied: ${warnings.blankReasonDetail}`);
  console.log(`  Invalid number of visitors -> defaulted to 1: ${warnings.invalidNumberOfVisitors}`);

  if (warnings.unknownVisitorType.length) {
    console.log(`  Unknown visitor type labels: ${[...new Set(warnings.unknownVisitorType)].join(" | ")}`);
  }

  if (warnings.unknownTaskStatus.length) {
    console.log(`  Unknown task status labels: ${[...new Set(warnings.unknownTaskStatus)].join(" | ")}`);
  }

  if (warnings.negativeDurationRows.length) {
    console.log("  Rows with sign-out earlier than sign-in:");
    for (const row of warnings.negativeDurationRows) {
      console.log(
        `    Row ${row.rowNumber}: ${row.visitorName} (${row.signInTime} -> ${row.signOutTime})`
      );
    }
  }

  if (!applyImport) {
    console.log("");
    console.log("Dry run only. Set APPLY_LEGACY_IMPORT=true to write these records to the database.");
    return;
  }

  for (const record of createInputs) {
    await prisma.visitRecord.create({
      data: record,
    });
  }

  console.log("");
  console.log(`Imported ${createInputs.length} visit records into ${hotel.name}.`);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
