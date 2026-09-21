import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import Certificate from "@/models/Certificate";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { generateQrDataUrl } from "@/lib/qr";
import { writeAudit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "qr")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const b = await Business.findById(params.id) as any;
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const qrDataUrl = await generateQrDataUrl(b.businessId);
  b.certificate = b.certificate || {};
  b.certificate.qrCodeUrl = qrDataUrl;
  await b.save();
  await Certificate.findOneAndUpdate({ businessId: b.businessId }, { businessId: b.businessId, certificateNumber: b.certificate?.certificateNumber, fileUrl: b.certificate?.fileUrl, qrCodeUrl: qrDataUrl, uploadedBy: session.username }, { upsert: true });
  await writeAudit({ user: session.sub, username: session.username, action: "QR_GENERATED", entity: "business", entityId: b.businessId });
  return NextResponse.json({ qrDataUrl, qrUrl: `/v/${b.businessId}` });
}
