import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { businessSchema } from "@/lib/validation";
import { normalizeName } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const b = await Business.findById(params.id).lean();
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(b);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "business:update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
  await dbConnect();
  const v = parsed.data;
  const prev = await Business.findById(params.id).lean() as any;
  try {
    const doc = await Business.findByIdAndUpdate(params.id, {
      businessId: v.businessId,
      businessName: v.businessName,
      businessNameNormalized: normalizeName(v.businessName),
      businessType: v.businessType,
      address: { addressLine: v.addressLine, ward: v.ward, district: v.district, city: v.city },
      phone: v.phone, email: v.email, taxCode: v.taxCode, status: v.status,
      verification: {
        verificationNumber: v.verificationNumber || undefined,
        verifiedAt: v.verifiedAt ? new Date(v.verifiedAt) : undefined,
        expiryDate: v.expiryDate ? new Date(v.expiryDate) : undefined,
        lastReviewedAt: new Date(),
      },
      certificate: { certificateNumber: v.certificateNumber, fileUrl: v.certificateFileUrl },
      publicVisibility: { visible: v.visible, showAddress: v.showAddress, showPhone: v.showPhone, showCertificate: v.showCertificate },
      internalNotes: v.internalNotes,
      updatedBy: session.username,
    }, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const action = prev?.status !== v.status ? "BUSINESS_STATUS_CHANGED" : "BUSINESS_UPDATED";
    await writeAudit({ user: session.sub, username: session.username, action, entity: "business", entityId: v.businessId, changes: { from: prev?.status, to: v.status }, ip: req.headers.get("x-forwarded-for") || "", userAgent: req.headers.get("user-agent") || "" });
    return NextResponse.json(doc);
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ error: "Duplicate businessId/verificationNumber" }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireUser(["ADMIN"]);
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const b = await Business.findByIdAndDelete(params.id);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeAudit({ user: session.sub, username: session.username, action: "BUSINESS_DELETED", entity: "business", entityId: (b as any).businessId });
  return NextResponse.json({ ok: true });
}
