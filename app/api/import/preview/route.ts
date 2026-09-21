import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import Import from "@/models/Import";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { parseWorkbook, validateRows } from "@/lib/excel";

// Vercel serverless functions have a payload/time budget: keep uploads small.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  if (!can(session.role, "import")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  if (!/(\.xlsx|\.xls|\.csv)$/i.test(file.name)) return NextResponse.json({ error: "Only .xlsx/.xls/.csv allowed" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  let rows;
  try { rows = parseWorkbook(buf); }
  catch { return NextResponse.json({ error: "Cannot parse Excel file" }, { status: 400 }); }
  if (rows.length > 5000) return NextResponse.json({ error: "Too many rows (max 5000)" }, { status: 400 });
  await dbConnect();
  const ids = rows.map((r) => r.business_id).filter(Boolean) as string[];
  const existing = await Business.find({ businessId: { $in: ids } }).lean();
  const map = new Map(existing.map((e: any) => [e.businessId, {
    businessName: e.businessName || "", status: e.status || "",
    expiryDate: e.verification?.expiryDate ? new Date(e.verification.expiryDate).toISOString().slice(0, 10) : "",
    ward: e.address?.ward || "", verificationNumber: e.verification?.verificationNumber || "",
    phone: e.phone || "", address: e.address?.addressLine || "",
  }]));
  const validated = validateRows(rows, map);
  const summary = {
    total: rows.length,
    new: validated.filter((v) => v.action === "CREATE").length,
    updated: validated.filter((v) => v.action === "UPDATE").length,
    unchanged: validated.filter((v) => v.action === "IGNORE").length,
    errors: validated.filter((v) => v.action === "ERROR").length,
  };
  // Persist the batch in MongoDB (NOT server memory): Vercel functions share
  // no in-memory state, so confirm() must look the batch up by token.
  const token = randomUUID();
  await Import.create({
    filename: file.name, uploadedBy: session.sub, username: session.username,
    totalRows: summary.total, created: summary.new, updated: summary.updated,
    unchanged: summary.unchanged, errors: summary.errors, status: "PREVIEW",
    token, rawRows: rows, preview: validated.slice(0, 200),
  });
  return NextResponse.json({ token, summary, rows: validated });
}
