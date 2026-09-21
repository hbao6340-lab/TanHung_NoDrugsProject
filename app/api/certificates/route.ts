import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { requireUser } from "@/lib/auth";
export async function GET() {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const items = await Certificate.find().sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ items });
}
