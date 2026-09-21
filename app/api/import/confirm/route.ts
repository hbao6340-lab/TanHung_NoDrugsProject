import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import Import from "@/models/Import";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { normalizeName } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_STATUSES = ["VERIFIED", "NEEDS_CORRECTION", "NOT_VERIFIED", "EXPIRED", "SUSPENDED"];

export async function POST(req: Request) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "import")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Missing preview token, please re-upload" }, { status: 400 });
  await dbConnect();
  // Look the batch up in MongoDB: serverless-safe (no in-memory state).
  const batch = (await Import.findOne({ token, status: "PREVIEW" }).lean()) as any;
  if (!batch) return NextResponse.json({ error: "Preview expired or already confirmed, please re-upload" }, { status: 400 });

  const rows: any[] = batch.rawRows || [];
  const seen = new Set<string>();
  const toInsert: any[] = [];
  const bulkUpdates: any[] = [];
  let unchanged = 0, errors = 0;

  // Classify every row first (never match by name; never delete missing rows).
  const ids = Array.from(new Set(rows.map((r) => (r.business_id || "").trim()).filter(Boolean)));
  const existingDocs = await Business.find({ businessId: { $in: ids } }).lean() as any[];
  const byId = new Map(existingDocs.map((d) => [d.businessId, d]));

  for (const r of rows) {
    const bid = (r.business_id || "").trim();
    if (!bid || seen.has(bid) || !r.business_name?.trim() || (r.status && !VALID_STATUSES.includes(r.status))) { errors++; continue; }
    seen.add(bid);
    const doc = {
      businessId: bid,
      businessName: r.business_name.trim(),
      businessNameNormalized: normalizeName(r.business_name.trim()),
      businessType: r.business_type || "",
      address: { addressLine: r.address || "", ward: r.ward || "", district: r.district || "", city: r.city || "" },
      phone: r.phone || "", email: r.email || "", taxCode: r.tax_code || "",
      status: r.status || "NOT_VERIFIED",
      verification: {
        verificationNumber: r.verification_number || undefined,
        verifiedAt: r.issue_date ? new Date(r.issue_date) : undefined,
        expiryDate: r.expiry_date ? new Date(r.expiry_date) : undefined,
        lastReviewedAt: new Date(),
      },
      certificate: { certificateNumber: "", fileUrl: r.certificate_file || "" },
      publicVisibility: { visible: String(r.public_visible).toUpperCase() !== "FALSE", showAddress: true, showPhone: false, showCertificate: true },
      internalNotes: r.notes || "",
      updatedBy: session.username,
    };
    const ex = byId.get(bid);
    if (!ex) {
      toInsert.push({ ...doc, source: { type: "excel" }, createdBy: session.username });
    } else if (ex.businessName === doc.businessName && ex.status === doc.status) {
      unchanged++;
    } else {
      bulkUpdates.push({ updateOne: { filter: { businessId: bid }, update: { $set: doc } } });
    }
  }

  try {
    // Batched writes: fast enough for Vercel's function time limits.
    if (toInsert.length) await Business.insertMany(toInsert, { ordered: false });
    if (bulkUpdates.length) await Business.bulkWrite(bulkUpdates, { ordered: false });
    const created = toInsert.length;
    const updated = bulkUpdates.length;
    await Import.updateOne({ _id: batch._id }, { $set: { status: "CONFIRMED", created, updated, unchanged, errors } });
    await Import.create({
      filename: batch.filename, uploadedBy: session.sub, username: session.username,
      totalRows: rows.length, created, updated, unchanged, errors, status: "CONFIRMED",
    });
    await writeAudit({
      user: session.sub, username: session.username, action: "EXCEL_IMPORTED",
      entity: "import", entityId: batch.filename, changes: { created, updated, unchanged, errors },
      ip: req.headers.get("x-forwarded-for") || "", userAgent: req.headers.get("user-agent") || "",
    });
    return NextResponse.json({ ok: true, message: `Nhập hoàn tất: ${created} mới, ${updated} cập nhật, ${unchanged} không đổi, ${errors} lỗi`, created, updated, unchanged, errors });
  } catch (e) {
    console.error(e);
    await Import.updateOne({ _id: batch._id }, { $set: { status: "FAILED" } }).catch(() => {});
    return NextResponse.json({ error: "Import failed, no silent deletes performed" }, { status: 500 });
  }
}
