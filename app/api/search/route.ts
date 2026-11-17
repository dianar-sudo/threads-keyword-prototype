import { NextRequest, NextResponse } from "next/server";
import { metaErrorMessage } from "@/lib/api-error";
import { threadsApiUrl } from "@/lib/env";
import { sessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = sessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Connect a Threads profile before searching." }, { status: 401 });

  let query = "";
  try {
    const body = await request.json() as { query?: unknown };
    query = typeof body.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Enter a keyword to search." }, { status: 400 });
  }
  if (!query) return NextResponse.json({ error: "Enter a keyword to search." }, { status: 400 });
  if (query.length > 250) return NextResponse.json({ error: "Search terms must be 250 characters or fewer." }, { status: 400 });

  const url = threadsApiUrl("keyword_search");
  url.searchParams.set("q", query);
  url.searchParams.set("search_type", "RECENT");
  url.searchParams.set("search_mode", "KEYWORD");
  url.searchParams.set("limit", "25");
  url.searchParams.set("fields", "id,text,username,permalink,timestamp,media_type,has_replies,is_quote_post,is_reply");

  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${session.accessToken}` },
      cache: "no-store"
    });
    if (!response.ok) return NextResponse.json({ error: await metaErrorMessage(response) }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not reach the Threads API. Try again in a moment." }, { status: 502 });
  }
}
