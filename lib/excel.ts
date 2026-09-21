import * as XLSX from "xlsx";
import { STATUSES } from "./constants";

export interface ImportRow {
  rowNumber: number;
  business_id?: string;
  business_name?: string;
  business_type?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  phone?: string;
  email?: string;
  tax_code?: string;
  status?: string;
  verification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_file?: string;
  public_visible?: string;
  notes?: string;
}

export interface RowValidation {
  rowNumber: number;
  valid: boolean;
  errors: string[];
  action: "CREATE" | "UPDATE" | "IGNORE" | "ERROR";
  changes?: { field: string; from: string; to: string }[];
  normalized?: Record<string, string>;
}

export const EXPECTED_COLUMNS = [
  "business_id", "business_name", "business_type", "address", "ward", "district",
  "city", "phone", "email", "tax_code", "status", "verification_number",
  "issue_date", "expiry_date", "certificate_file", "public_visible", "notes",
];

export function parseWorkbook(buffer: Buffer): ImportRow[] {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
  return json.map((r, i) => {
    const lower: Record<string, unknown> = {};
    for (const k of Object.keys(r)) lower[k.trim().toLowerCase()] = r[k];
    const cell = (v: unknown): string => {
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      return String(v ?? "").trim();
    };
    return {
      rowNumber: i + 2,
      business_id: cell(lower["business_id"]),
      business_name: cell(lower["business_name"]),
      business_type: cell(lower["business_type"]),
      address: cell(lower["address"]),
      ward: cell(lower["ward"]),
      district: cell(lower["district"]),
      city: cell(lower["city"]),
      phone: cell(lower["phone"]),
      email: cell(lower["email"]),
      tax_code: cell(lower["tax_code"]),
      status: cell(lower["status"]).toUpperCase(),
      verification_number: cell(lower["verification_number"]),
      issue_date: cell(lower["issue_date"]),
      expiry_date: cell(lower["expiry_date"]),
      certificate_file: cell(lower["certificate_file"]),
      public_visible: cell(lower["public_visible"]),
      notes: cell(lower["notes"]),
    };
  });
}

export function validateRows(
  rows: ImportRow[],
  existingByBusinessId: Map<string, Record<string, string>>
): RowValidation[] {
  const seen = new Set<string>();
  return rows.map((r) => {
    const errors: string[] = [];
    const bid = (r.business_id || "").trim();
    if (!bid) errors.push("business_id is missing");
    else if (!/^TH-\d{4}-\d{5}$/.test(bid)) errors.push("business_id format must be TH-YYYY-NNNNN");
    if (bid && seen.has(bid)) errors.push("duplicate business_id inside file");
    if (bid) seen.add(bid);
    if (!r.business_name?.trim()) errors.push("business_name is required");
    if (r.status && !(STATUSES as string[]).includes(r.status)) errors.push(`invalid status: ${r.status}`);
    if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) errors.push("invalid email");
    if (errors.length) return { rowNumber: r.rowNumber, valid: false, errors, action: "ERROR" as const };

    const existing = existingByBusinessId.get(bid);
    if (!existing) return { rowNumber: r.rowNumber, valid: true, errors: [], action: "CREATE" as const };
    // diff key fields
    const fields: [string, string, string][] = [
      ["business_name", existing.businessName || "", r.business_name || ""],
      ["status", existing.status || "", r.status || ""],
      ["expiry_date", existing.expiryDate || "", r.expiry_date || ""],
      ["ward", existing.ward || "", r.ward || ""],
      ["verification_number", existing.verificationNumber || "", r.verification_number || ""],
      ["phone", existing.phone || "", r.phone || ""],
      ["address", existing.address || "", r.address || ""],
    ];
    const changes = fields
      .filter(([, a, b]) => a !== b)
      .map(([field, from, to]) => ({ field, from, to }));
    if (changes.length === 0) return { rowNumber: r.rowNumber, valid: true, errors: [], action: "IGNORE" as const };
    return { rowNumber: r.rowNumber, valid: true, errors: [], action: "UPDATE" as const, changes };
  });
}

export function buildTemplateWorkbook(): Buffer {
  const ws = XLSX.utils.json_to_sheet([
    {
      business_id: "TH-2026-00001", business_name: "ABC Coffee", business_type: "Cafe",
      address: "123 Main St", ward: "Ward 1", district: "District 1", city: "HCMC",
      phone: "0900000001", email: "abc@example.com", tax_code: "0312345678",
      status: "VERIFIED", verification_number: "VN-2026-00001",
      issue_date: "2026-01-15", expiry_date: "2027-01-15", certificate_file: "",
      public_visible: "TRUE", notes: "",
    },
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "businesses");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
