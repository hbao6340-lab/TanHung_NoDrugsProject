import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { dbConnect } from "../lib/db";
import Business from "../models/Business";
import { normalizeName } from "../lib/utils";

async function main() {
  await dbConnect();
  const samples = [
    { businessId: "TH-2026-00001", businessName: "ABC Coffee", status: "VERIFIED", ward: "Ward 1", verificationNumber: "VN-2026-00001", expiry: "2027-09-01" },
    { businessId: "TH-2026-00002", businessName: "XYZ Mart", status: "NEEDS_CORRECTION", ward: "Ward 2", verificationNumber: "VN-2026-00002", expiry: "2026-12-01" },
    { businessId: "TH-2026-00003", businessName: "Mekong Foods", status: "NOT_VERIFIED", ward: "Ward 1", verificationNumber: "", expiry: undefined },
  ];
  for (const s of samples) {
    await Business.findOneAndUpdate(
      { businessId: s.businessId },
      {
        businessId: s.businessId, businessName: s.businessName, businessNameNormalized: normalizeName(s.businessName),
        businessType: "Retail", address: { addressLine: "123 Main St", ward: s.ward, district: "District 1", city: "HCMC" },
        phone: "0900000000", status: s.status,
        verification: { verificationNumber: s.verificationNumber || undefined, verifiedAt: new Date("2026-01-15"), expiryDate: s.expiry ? new Date(s.expiry) : undefined, lastReviewedAt: new Date() },
        publicVisibility: { visible: true, showAddress: true, showPhone: false, showCertificate: true },
        source: { type: "seed" },
      },
      { upsert: true }
    );
  }
  console.log("Seeded 3 businesses");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
