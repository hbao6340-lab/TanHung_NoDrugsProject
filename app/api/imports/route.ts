import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Import from "@/models/Import";
import { requireUser } from "@/lib/auth";
export async function GET() {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const items = await Import.find().sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ items });
}
