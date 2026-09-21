import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return;
  const token = req.cookies.get("bvp_session")?.value;
  if (!token) return Response.redirect(new URL("/login", req.url));
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me-please-1234567890"));
  } catch {
    return Response.redirect(new URL("/login", req.url));
  }
}
export const config = { matcher: ["/admin/:path*"] };
