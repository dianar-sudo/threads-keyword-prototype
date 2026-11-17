export async function metaErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: { message?: string }; message?: string };
    return body.error?.message || body.message || `Threads API returned HTTP ${response.status}`;
  } catch {
    return `Threads API returned HTTP ${response.status}`;
  }
}
