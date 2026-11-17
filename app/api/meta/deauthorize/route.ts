import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignedRequest } from "@/lib/meta-signed-request";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const signedRequest = form.get("signed_request");
  if (typeof signedRequest !== "string" || !verifyMetaSignedRequest(signedRequest)) {
    return NextResponse.json({ error: "Invalid signed request." }, { status: 400 });
  }
  // This prototype keeps no server-side profile database. Clearing the app's
  // encrypted session cookie is handled by the user's Disconnect action.
  return new NextResponse(null, { status: 200 });
}
