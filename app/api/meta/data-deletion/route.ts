import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { verifyMetaSignedRequest } from "@/lib/meta-signed-request";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const signedRequest = form.get("signed_request");
  if (typeof signedRequest !== "string" || !verifyMetaSignedRequest(signedRequest)) {
    return NextResponse.json({ error: "Invalid signed request." }, { status: 400 });
  }

  // No account data or searches are persisted by this prototype. The callback
  // returns a status URL and confirmation code as requested by Meta.
  const confirmationCode = randomBytes(12).toString("hex");
  const base = appUrl(request.url);
  return NextResponse.json({
    url: `${base}/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode
  });
}
