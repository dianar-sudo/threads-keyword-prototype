import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = sessionFromRequest(request);
  if (!session) {
    const response = NextResponse.json({ connected: false });
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }
  return NextResponse.json({ connected: true, username: session.username, expiresAt: session.expiresAt }, {
    headers: { "cache-control": "no-store" }
  });
}
