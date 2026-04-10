import { RecordStatus, TaskStatus, VisitorType } from "@prisma/client";
import { z } from "zod";

const signatureSchema = z
  .string()
  .min(20, "Signature is required.")
  .startsWith("data:image/", "Signature format is invalid.");

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}, z.string().optional());

export const signInSchema = z.object({
  hotelSlug: z.string().min(1),
  visitorName: z.string().trim().min(1, "Visitor name is required."),
  companyName: z.string().trim().min(1, "Company name is required."),
  contactNumber: z.string().trim().min(1, "Contact number is required."),
  carRegistrationNumber: optionalText,
  visitorType: z.nativeEnum(VisitorType),
  numberOfVisitors: z.coerce
    .number()
    .int("Number of visitors must be a whole number.")
    .min(1, "Number of visitors must be at least 1."),
  reasonDetail: z.string().trim().min(1, "Visit reason is required."),
  contractorSet: optionalText,
  additionalKey: optionalText,
  signInSignature: signatureSchema,
});

export const signOutSchema = z.object({
  hotelSlug: z.string().min(1),
  visitRecordId: z.string().trim().min(1, "Visitor name is required."),
  taskStatus: z.nativeEnum(TaskStatus),
  signOutNote: optionalText,
  keyReturnTo: z.string().trim().min(1, "Hotel staff name is required."),
  contractorSignOutSignature: signatureSchema,
  hotelStaffSignature: signatureSchema,
});

export const loginSchema = z.object({
  hotelSlug: z.string().min(1),
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().trim().min(1, "Password is required."),
});

export const adminRecordSchema = z
  .object({
    visitorName: z.string().trim().min(1, "Visitor name is required."),
    companyName: z.string().trim().min(1, "Company name is required."),
    contactNumber: z.string().trim().min(1, "Contact number is required."),
    carRegistrationNumber: optionalText,
    visitorType: z.nativeEnum(VisitorType),
    numberOfVisitors: z.coerce
      .number()
      .int("Number of visitors must be a whole number.")
      .min(1, "Number of visitors must be at least 1."),
    reasonDetail: z.string().trim().min(1, "Visit reason is required."),
    contractorSet: optionalText,
    additionalKey: optionalText,
    signInSignature: signatureSchema,
    signInAt: z.string().trim().min(1, "Sign in time is required."),
    recordStatus: z.nativeEnum(RecordStatus),
    signOutAt: optionalText,
    taskStatus: z.nativeEnum(TaskStatus).optional(),
    signOutNote: optionalText,
    keyReturnTo: optionalText,
    contractorSignOutSignature: optionalText,
    hotelStaffSignature: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.recordStatus === RecordStatus.CLOSED) {
      if (!data.signOutAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["signOutAt"],
          message: "Sign out time is required when the record is closed.",
        });
      }
      if (!data.taskStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taskStatus"],
          message: "Task status is required when the record is closed.",
        });
      }
      if (!data.keyReturnTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["keyReturnTo"],
          message: "Hotel staff name is required when the record is closed.",
        });
      }
      if (!data.contractorSignOutSignature) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contractorSignOutSignature"],
          message: "Contractor sign out signature is required when the record is closed.",
        });
      }
      if (!data.hotelStaffSignature) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hotelStaffSignature"],
          message: "Hotel staff signature is required when the record is closed.",
        });
      }
    }
  });

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
