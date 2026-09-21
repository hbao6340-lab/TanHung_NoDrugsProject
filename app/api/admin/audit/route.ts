import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { requireUser } from "@/lib/auth";
export async function GET(req: Request) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, parseInt(searchParams.get("limit") || "50"));
  const items = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json({ items });
}
