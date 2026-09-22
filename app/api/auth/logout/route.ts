import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

function clearCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function POST(req: Request) {
  // Direct form navigations (Sec-Fetch-Mode: navigate) land on "/" instead of
  // a raw JSON page; fetch callers keep the JSON response.
  if (req.headers.get("sec-fetch-mode") === "navigate") {
    const res = NextResponse.redirect(new URL("/", req.url), 303);
    return clearCookie(res);
  }
  return clearCookie(NextResponse.json({ ok: true }));
}
