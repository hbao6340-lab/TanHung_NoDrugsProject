import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { businessSchema } from "@/lib/validation";
import { normalizeName } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "business:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, 200);
  const st = searchParams.get("status") || "";
  const ward = searchParams.get("ward") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const filter: any = {};
  if (q) filter.$or = [{ businessId: { $regex: q, $options: "i" } }, { businessName: { $regex: q, $options: "i" } }, { "verification.verificationNumber": { $regex: q, $options: "i" } }];
  if (st) filter.status = st;
  if (ward) filter["address.ward"] = { $regex: ward, $options: "i" };
  const [items, total] = await Promise.all([
    Business.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Business.countDocuments(filter),
  ]);
  return NextResponse.json({ items, total, page });
}

export async function POST(req: Request) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "business:create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
  await dbConnect();
  const v = parsed.data;
  try {
    const doc = await Business.create({
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
        verifiedBy: session.username, lastReviewedAt: new Date(),
      },
      certificate: { certificateNumber: v.certificateNumber, fileUrl: v.certificateFileUrl },
      publicVisibility: { visible: v.visible, showAddress: v.showAddress, showPhone: v.showPhone, showCertificate: v.showCertificate },
      internalNotes: v.internalNotes,
      source: { type: "manual" },
      createdBy: session.username, updatedBy: session.username,
    });
    await writeAudit({ user: session.sub, username: session.username, action: "BUSINESS_CREATED", entity: "business", entityId: v.businessId, ip: req.headers.get("x-forwarded-for") || "", userAgent: req.headers.get("user-agent") || "" });
    return NextResponse.json(doc, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ error: "businessId hoặc verificationNumber đã tồn tại" }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
