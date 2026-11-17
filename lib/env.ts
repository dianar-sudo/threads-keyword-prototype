export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function appUrl(requestUrl?: string): string {
  const configured = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (requestUrl) return new URL(requestUrl).origin;
  throw new Error("Missing environment variable: APP_URL");
}

export function threadsApiUrl(path: string): URL {
  const version = process.env.THREADS_API_VERSION?.trim() || "v1.0";
  return new URL(`/${version}/${path.replace(/^\//, "")}`, "https://graph.threads.net");
}
