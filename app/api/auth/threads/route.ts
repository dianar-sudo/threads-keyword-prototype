import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/env";
import { STATE_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const state = randomBytes(32).toString("hex");
    const redirectUri = requiredEnv("THREADS_REDIRECT_URI");
    const authorizeUrl = new URL("https://threads.net/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", requiredEnv("THREADS_APP_ID"));
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("scope", "threads_basic,threads_keyword_search");
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start Threads authorization.";
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(message)}`, request.url));
  }
}
