import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { masterUsername } from "@/lib/permissions";
import { userSchema } from "@/lib/validation";
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
  const body = await req.json().catch(() => null);
  const parsed = userSchema.safeParse({
    username: typeof body?.username === "string" ? body.username.trim() : "",
    password: body?.password ?? "",
    role: body?.role ?? "STAFF",
    active: body?.active !== false,
  });
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
  const { username, password, role, active } = parsed.data;
  await dbConnect();
  try {
    const u = await User.create({ username, passwordHash: await hashPassword(password!), role, active });
    await writeAudit({ user: session.sub, username: session.username, action: "USER_CREATED", entity: "user", entityId: username, changes: { role } });
    return NextResponse.json({ _id: u._id, username: u.username, role: u.role, active: u.active }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: number })?.code === 11000)
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "Tạo tài khoản thất bại" }, { status: 500 });
  }
}
