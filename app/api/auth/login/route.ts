import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, signToken, SESSION_COOKIE } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";

export async function POST(req: Request) {
  if (!rateLimit("login:" + clientKey(req), 10, 60_000))
    return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  await dbConnect();
  const u = await User.findOne({ username });
  if (!u || !u.active || !(await verifyPassword(password, u.passwordHash))) {
    return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
  }
  u.lastLogin = new Date(); await u.save();
  const token = await signToken({ sub: String(u._id), username: u.username, role: u.role });
  await writeAudit({ user: String(u._id), username: u.username, action: "USER_LOGIN", entity: "user", entityId: String(u._id), ip: clientKey(req), userAgent: req.headers.get("user-agent") || "" });
  const res = NextResponse.json({ ok: true, role: u.role });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 12 * 3600 });
  return res;
}
