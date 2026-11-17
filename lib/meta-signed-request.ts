import { createHmac, timingSafeEqual } from "node:crypto";
import { requiredEnv } from "@/lib/env";

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function verifyMetaSignedRequest(signedRequest: string): Record<string, unknown> | null {
  const [encodedSignature, encodedPayload, extra] = signedRequest.split(".");
  if (!encodedSignature || !encodedPayload || extra) return null;

  try {
    const signature = decodeBase64Url(encodedSignature);
    const expected = createHmac("sha256", requiredEnv("THREADS_APP_SECRET"))
      .update(encodedPayload)
      .digest();
    if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;

    const payload = JSON.parse(decodeBase64Url(encodedPayload).toString("utf8")) as Record<string, unknown>;
    if (payload.algorithm !== "HMAC-SHA256") return null;
    return payload;
  } catch {
    return null;
  }
}
