import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { masterUsername } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  const { session, error, status } = await requireUser(["ADMIN"]);
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const items = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items, master: masterUsername() });
}
export async function POST(req: Request) {
  const { session, error, status } = await requireUser(["ADMIN"]);
  if (!session) return NextResponse.json({ error }, { status });
  const { username, password, role, active } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await dbConnect();
  const u = await User.create({ username, passwordHash: await hashPassword(password), role: role || "VIEWER", active: active !== false });
  await writeAudit({ user: session.sub, username: session.username, action: "USER_CREATED", entity: "user", entityId: username });
  return NextResponse.json({ _id: u._id, username: u.username, role: u.role }, { status: 201 });
}
