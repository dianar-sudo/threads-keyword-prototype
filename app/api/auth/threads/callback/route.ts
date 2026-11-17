import { NextRequest, NextResponse } from "next/server";
import { metaErrorMessage } from "@/lib/api-error";
import { appUrl, requiredEnv, threadsApiUrl } from "@/lib/env";
import { SESSION_COOKIE, setSessionCookie, STATE_COOKIE, type ThreadsSession } from "@/lib/session";

export const runtime = "nodejs";

function returnWithError(request: NextRequest, message: string) {
  const response = NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(message)}`, request.url));
  response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  if (oauthError) return returnWithError(request, `Threads authorization was not completed: ${oauthError}`);
  if (!code) return returnWithError(request, "Threads did not return an authorization code. Start the connection again.");
  if (!returnedState || !expectedState || returnedState !== expectedState) {
    return returnWithError(request, "The authorization check failed. Start the connection again.");
  }

  try {
    const appId = requiredEnv("THREADS_APP_ID");
    const appSecret = requiredEnv("THREADS_APP_SECRET");
    const redirectUri = requiredEnv("THREADS_REDIRECT_URI");
    // OAuth token endpoints are unversioned. API data endpoints such as /me
    // and /keyword_search use the configured Graph API version.
    const shortTokenResponse = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      }),
      cache: "no-store"
    });
    if (!shortTokenResponse.ok) throw new Error(await metaErrorMessage(shortTokenResponse));
    const shortToken = await shortTokenResponse.json() as { access_token?: string; user_id?: string };
    if (!shortToken.access_token || !shortToken.user_id) throw new Error("Threads did not return a user access token.");

    const longTokenUrl = new URL("https://graph.threads.net/access_token");
    longTokenUrl.searchParams.set("grant_type", "th_exchange_token");
    longTokenUrl.searchParams.set("client_secret", appSecret);
    longTokenUrl.searchParams.set("access_token", shortToken.access_token);
    const longTokenResponse = await fetch(longTokenUrl, { cache: "no-store" });
    if (!longTokenResponse.ok) throw new Error(await metaErrorMessage(longTokenResponse));
    const longToken = await longTokenResponse.json() as { access_token?: string; expires_in?: number };
    if (!longToken.access_token) throw new Error("Threads did not return a long-lived access token.");

    const profileUrl = threadsApiUrl("me");
    profileUrl.searchParams.set("fields", "id,username");
    const profileResponse = await fetch(profileUrl, {
      headers: { authorization: `Bearer ${longToken.access_token}` },
      cache: "no-store"
    });
    const profile = profileResponse.ok
      ? await profileResponse.json() as { id?: string; username?: string }
      : { id: shortToken.user_id, username: "Threads user" };

    const expiresIn = longToken.expires_in || 60 * 24 * 60 * 60;
    const session: ThreadsSession = {
      accessToken: longToken.access_token,
      userId: profile.id || shortToken.user_id,
      username: profile.username || "Threads user",
      expiresAt: Date.now() + expiresIn * 1000
    };

    const response = NextResponse.redirect(new URL("/?connected=1", appUrl(request.url)));
    setSessionCookie(response, session);
    response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Threads authorization failed.";
    return returnWithError(request, message);
  }
}
