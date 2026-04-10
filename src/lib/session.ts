import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: string;
  hotelId: string;
  hotelCode: string;
  hotelSlug: string;
  name: string;
  username: string;
  role: "ADMIN" | "STAFF";
};

const COOKIE_NAME = "contractor-visitor-session";
const SESSION_MAX_AGE = 60 * 60 * 12;

function getSecret() {
  return process.env.SESSION_SECRET ?? "contractor-visitor-log-dev-secret";
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(payload: SessionPayload) {
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (signature.length !== expectedSignature.length) {
    return null;
  }
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    return null;
  }

  try {
    return JSON.parse(decode(encodedPayload)) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function setSession(payload: SessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
