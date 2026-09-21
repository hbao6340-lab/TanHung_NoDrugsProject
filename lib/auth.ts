import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { dbConnect } from "./db";
import User from "@/models/User";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me-please-1234567890");
const COOKIE = "bvp_session";

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}
export async function signToken(payload: { sub: string; username: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}
export async function getSession(): Promise<{ sub: string; username: string; role: string } | null> {
  try {
    const c = cookies().get(COOKIE)?.value;
    if (!c) return null;
    const { payload } = await jwtVerify(c, secret);
    return payload as unknown as { sub: string; username: string; role: string };
  } catch {
    return null;
  }
}
export async function requireUser(roles?: string[]) {
  const s = await getSession();
  if (!s) return { error: "Unauthorized", status: 401 as const, session: null };
  if (roles && !roles.includes(s.role)) return { error: "Forbidden", status: 403 as const, session: null };
  return { error: null, status: 200 as const, session: s };
}
export async function getCurrentDbUser() {
  const s = await getSession();
  if (!s) return null;
  await dbConnect();
  return User.findById(s.sub);
}
export const SESSION_COOKIE = COOKIE;
