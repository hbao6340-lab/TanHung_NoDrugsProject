import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sanitizeQuery } from "@/lib/utils";

function toPublic(b: any) {
  const vis = b.publicVisibility || {};
  if (vis.visible === false) return null;
  return {
    businessId: b.businessId,
    businessName: b.businessName,
    status: b.status,
    verificationNumber: b.verification?.verificationNumber || "",
    ward: vis.showAddress === false ? undefined : b.address?.ward,
    updatedAt: b.updatedAt,
  };
}

export async function GET(req: Request) {
  if (!rateLimit("search:" + clientKey(req), 60, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 200);
  if (q.length < 2) return NextResponse.json({ results: [] });
  await dbConnect();
  const safe = sanitizeQuery(q);
  const or: any[] = [
    { businessId: { $regex: safe, $options: "i" } },
    { "verification.verificationNumber": { $regex: safe, $options: "i" } },
    { businessName: { $regex: safe, $options: "i" } },
  ];
  const docs = await Business.find({ $or: or, "publicVisibility.visible": { $ne: false } })
    .limit(20).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ results: docs.map(toPublic).filter(Boolean) });
}
