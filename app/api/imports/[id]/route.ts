import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Import from "@/models/Import";
import { requireUser } from "@/lib/auth";
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const item = await Import.findById(params.id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}
