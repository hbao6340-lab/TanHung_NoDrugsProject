import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireUser, hashPassword } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser(["ADMIN"]);
  if (!session) return NextResponse.json({ error }, { status });
  const body = await req.json();
  await dbConnect();
  const update: any = {};
  if (body.role) update.role = body.role;
  if (typeof body.active === "boolean") update.active = body.active;
  if (body.password) update.passwordHash = await hashPassword(body.password);
  const u = await User.findByIdAndUpdate(params.id, update, { new: true }).select("-passwordHash");
  await writeAudit({ user: session.sub, username: session.username, action: body.active === false ? "USER_DISABLED" : "USER_UPDATED", entity: "user", entityId: params.id });
  return NextResponse.json(u);
}
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser(["ADMIN"]);
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  await User.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
