import { RecordStatus, Role, TaskStatus, VisitorType } from "@prisma/client";

export const visitorTypeOptions: Array<{ value: VisitorType; label: string }> = [
  {
    value: VisitorType.CONTRACTOR,
    label: "Contractors - External service providers (e.g., maintenance, IT).",
  },
  {
    value: VisitorType.VENDOR_SUPPLIER,
    label: "Vendors/Suppliers - Delivering goods or services.",
  },
  {
    value: VisitorType.CLIENT_CUSTOMER,
    label: "Clients/Customers - Visiting for business or meetings.",
  },
  {
    value: VisitorType.INTERVIEWEE,
    label: "Interviewees - Job applicants attending interviews.",
  },
  {
    value: VisitorType.AUDITOR_INSPECTOR,
    label: "Auditors/Inspectors - For compliance or operational reviews.",
  },
  {
    value: VisitorType.GUEST,
    label: "Guests - Personal or VIP visitors of staff or executives.",
  },
  {
    value: VisitorType.PRE_ONBOARDED_STAFF,
    label: "Pre-Onboarded Staff - Trainee with pending account, or pre-onboarded staff without access.",
  },
];

export const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: TaskStatus.COMPLETE, label: "Complete" },
  { value: TaskStatus.ON_GOING, label: "On Going" },
  { value: TaskStatus.DEFERRED, label: "Deferred" },
  { value: TaskStatus.CANCELLED, label: "Cancelled" },
  { value: TaskStatus.OTHER, label: "None of the above" },
];

export const recordStatusOptions: Array<{ value: RecordStatus; label: string }> = [
  { value: RecordStatus.OPEN, label: "Open" },
  { value: RecordStatus.CLOSED, label: "Closed" },
];

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  STAFF: "Staff",
};

export const hotelBrandAssets: Record<
  string,
  { logoSrc: string; logoAlt: string; bannerSrc: string; bannerAlt: string }
> = {
  "sydney-qvb": {
    logoSrc: "/hotel-heroes/logo-sqvb.png",
    logoAlt: "YEHS Hotel Sydney QVB logo",
    bannerSrc: "/hotel-heroes/SQVB-banner.png",
    bannerAlt: "YEHS Hotel Sydney QVB banner",
  },
  "sydney-harbour-suites": {
    logoSrc: "/hotel-heroes/logo-shs.png",
    logoAlt: "YEHS Hotel Sydney Harbour Suites logo",
    bannerSrc: "/hotel-heroes/SHS-banner.png",
    bannerAlt: "YEHS Hotel Sydney Harbour Suites banner",
  },
  "sydney-cbd": {
    logoSrc: "/hotel-heroes/logo-scbd.png",
    logoAlt: "YEHS Hotel Sydney CBD logo",
    bannerSrc: "/hotel-heroes/SCBD-banner.png",
    bannerAlt: "YEHS Hotel Sydney CBD banner",
  },
  "melbourne-cbd": {
    logoSrc: "/hotel-heroes/logo-mcbd.png",
    logoAlt: "YEHS Hotel Melbourne CBD logo",
    bannerSrc: "/hotel-heroes/MCBD-banner.png",
    bannerAlt: "YEHS Hotel Melbourne CBD banner",
  },
};

export const hotelKeySubmissionNotice = `Each key set or individual key requires a separate log submission.
If you are collecting more than one key set or key, please complete multiple log entries, one for each key.
This ensures accurate tracking and accountability for all issued keys.`;
