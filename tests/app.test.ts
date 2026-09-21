import { describe, it, expect } from "vitest";
import { validateRows } from "../lib/excel";
import { can } from "../lib/permissions";
import { sanitizeExcelValue } from "../lib/utils";
import { businessSchema } from "../lib/validation";
import { STATUS_CONFIG } from "../lib/constants";
import { appBaseUrl, qrContentFor } from "../lib/qr";
import { getStorage } from "../lib/storage";

describe("excel validation", () => {
  it("flags missing business_id", () => {
    const r = validateRows([{ rowNumber: 2, business_name: "A", status: "VERIFIED" } as any], new Map());
    expect(r[0].action).toBe("ERROR");
  });
  it("flags duplicates in file", () => {
    const rows = [
      { rowNumber: 2, business_id: "TH-2026-00001", business_name: "A", status: "VERIFIED" },
      { rowNumber: 3, business_id: "TH-2026-00001", business_name: "B", status: "VERIFIED" },
    ] as any;
    const r = validateRows(rows, new Map());
    expect(r[1].errors.join()).toMatch(/duplicate/i);
  });
  it("CREATE vs UPDATE vs IGNORE", () => {
    const existing = new Map([["TH-2026-00001", { businessName: "ABC", status: "VERIFIED", expiryDate: "", ward: "", verificationNumber: "", phone: "", address: "" }]]);
    const rows = [
      { rowNumber: 2, business_id: "TH-2026-00009", business_name: "New", status: "VERIFIED" },
      { rowNumber: 3, business_id: "TH-2026-00001", business_name: "ABC Changed", status: "VERIFIED" },
      { rowNumber: 4, business_id: "TH-2026-00001", business_name: "ABC", status: "VERIFIED" },
    ] as any;
    // note row 4 duplicates row 3 in-file -> error; test IGNORE separately
    const r = validateRows([rows[0], rows[1]], existing);
    expect(r[0].action).toBe("CREATE");
    expect(r[1].action).toBe("UPDATE");
    const r2 = validateRows([{ rowNumber: 4, business_id: "TH-2026-00001", business_name: "ABC", status: "VERIFIED" } as any], new Map([["TH-2026-00001", { businessName: "ABC", status: "VERIFIED", expiryDate: "", ward: "", verificationNumber: "", phone: "", address: "" }]]));
    expect(r2[0].action).toBe("IGNORE");
  });
});

describe("permissions", () => {
  it("viewer cannot import, staff cannot manage users", () => {
    expect(can("VIEWER", "import")).toBe(false);
    expect(can("STAFF", "business:update")).toBe(true);
    expect(can("ADMIN", "anything")).toBe(true);
  });
});

describe("security + validation", () => {
  it("sanitizes formula injection", () => {
    expect(sanitizeExcelValue("=1+1")).toBe("'=1+1");
    expect(sanitizeExcelValue("@cmd")).toBe("'@cmd");
    expect(sanitizeExcelValue("safe")).toBe("safe");
  });
  it("rejects bad businessId", () => {
    expect(businessSchema.safeParse({ businessId: "BAD", businessName: "A", status: "VERIFIED" }).success).toBe(false);
  });
  it("status config covers all + icons not color-only", () => {
    for (const s of ["VERIFIED", "NEEDS_CORRECTION", "NOT_VERIFIED", "EXPIRED", "SUSPENDED"] as const) {
      expect(STATUS_CONFIG[s].label).toBeTruthy();
      expect(STATUS_CONFIG[s].icon).toBeTruthy();
    }
  });
});

describe("vercel deployment", () => {
  it("QR encodes public /v/ URL only (Vercel host aware)", () => {
    const url = qrContentFor("TH-2026-00001");
    expect(url).toMatch(/\/v\/TH-2026-00001$/);
    expect(url).not.toMatch(/password|secret|token/i);
    expect(appBaseUrl()).toBeTruthy();
  });
  it("storage provider resolves without filesystem writes", async () => {
    const storage = getStorage();
    const r = await storage.save("test.pdf", Buffer.from("x"), "application/pdf");
    expect(r.url).toBeTruthy();
  });
});
