import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/env";

export const SESSION_COOKIE = "threads_prototype_session";
export const STATE_COOKIE = "threads_oauth_state";
export const SESSION_MAX_AGE = 60 * 24 * 60 * 60;

export type ThreadsSession = {
  accessToken: string;
  userId: string;
  username: string;
  expiresAt: number;
};

function key(): Buffer {
  return createHash("sha256").update(requiredEnv("THREADS_SESSION_SECRET")).digest();
}

export function sealSession(session: ThreadsSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final()
  ]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function openSession(value?: string): ThreadsSession | null {
  if (!value) return null;
  try {
    const [ivPart, tagPart, encryptedPart] = value.split(".");
    if (!ivPart || !tagPart || !encryptedPart) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivPart, "base64url"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64url")),
      decipher.final()
    ]).toString("utf8");
    const session = JSON.parse(decrypted) as ThreadsSession;
    if (!session.accessToken || !session.userId || !session.expiresAt) return null;
    if (session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionFromRequest(request: NextRequest): ThreadsSession | null {
  return openSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(response: NextResponse, session: ThreadsSession): void {
  const seconds = Math.max(0, Math.min(SESSION_MAX_AGE, Math.floor((session.expiresAt - Date.now()) / 1000)));
  response.cookies.set(SESSION_COOKIE, sealSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: seconds
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
