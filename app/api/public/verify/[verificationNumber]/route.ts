import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
export async function GET(_req: Request, { params }: { params: { verificationNumber: string } }) {
  await dbConnect();
  const b = await Business.findOne({ "verification.verificationNumber": params.verificationNumber }).lean() as any;
  if (!b || b.publicVisibility?.visible === false) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ businessId: b.businessId, businessName: b.businessName, status: b.status, verificationNumber: b.verification?.verificationNumber, updatedAt: b.updatedAt });
}
