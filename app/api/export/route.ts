import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { sanitizeExcelValue } from "@/lib/utils";
import { buildTemplateWorkbook } from "@/lib/excel";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("template") === "1") {
    const buf = buildTemplateWorkbook();
    return new Response(buf as unknown as BodyInit, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=template.xlsx" } });
  }
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "export")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const st = searchParams.get("status") || "";
  const ward = searchParams.get("ward") || "";
  const filter: any = {};
  if (st) filter.status = st;
  if (ward) filter["address.ward"] = { $regex: ward, $options: "i" };
  const docs = await Business.find(filter).limit(5000).lean();
  const rows = (docs as any[]).map((b) => {
    const r: Record<string, unknown> = {
      business_id: b.businessId, business_name: b.businessName, business_type: b.businessType,
      address: b.address?.addressLine, ward: b.address?.ward, district: b.address?.district, city: b.address?.city,
      phone: b.phone, email: b.email, tax_code: b.taxCode, status: b.status,
      verification_number: b.verification?.verificationNumber,
      issue_date: b.verification?.verifiedAt ? new Date(b.verification.verifiedAt).toISOString().slice(0, 10) : "",
      expiry_date: b.verification?.expiryDate ? new Date(b.verification.expiryDate).toISOString().slice(0, 10) : "",
      certificate_file: b.certificate?.fileUrl, public_visible: b.publicVisibility?.visible, notes: "",
    };
    for (const k of Object.keys(r)) r[k] = sanitizeExcelValue(r[k]);
    return r;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "businesses");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buf as unknown as BodyInit, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=businesses.xlsx" } });
}
