import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";

export async function GET(_req: Request, { params }: { params: { businessId: string } }) {
  await dbConnect();
  const b = await Business.findOne({ businessId: params.businessId }).lean() as any;
  if (!b || b.publicVisibility?.visible === false) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const vis = b.publicVisibility || {};
  return NextResponse.json({
    businessId: b.businessId,
    businessName: b.businessName,
    businessType: b.businessType,
    status: b.status,
    verificationNumber: b.verification?.verificationNumber,
    verifiedAt: b.verification?.verifiedAt,
    expiryDate: b.verification?.expiryDate,
    addressLine: vis.showAddress === false ? undefined : b.address?.addressLine,
    ward: vis.showAddress === false ? undefined : b.address?.ward,
    district: vis.showAddress === false ? undefined : b.address?.district,
    city: vis.showAddress === false ? undefined : b.address?.city,
    phone: vis.showPhone ? b.phone : undefined,
    certificateNumber: b.certificate?.certificateNumber,
    certificateFileUrl: vis.showCertificate === false ? undefined : b.certificate?.fileUrl,
    updatedAt: b.updatedAt,
  });
}
