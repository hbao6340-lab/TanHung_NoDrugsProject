import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import Import from "@/models/Import";
import { requireUser } from "@/lib/auth";
export async function GET() {
  const { session, error, status } = await requireUser();
  if (!session) return NextResponse.json({ error }, { status });
  await dbConnect();
  const [total, byStatus, byWard, activity, recentImports, importErrors] = await Promise.all([
    Business.countDocuments(),
    Business.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).then((r) => Object.fromEntries(r.map((x: any) => [x._id, x.count]))),
    Business.aggregate([{ $group: { _id: "$address.ward", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
    Business.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $limit: 30 }]),
    Import.countDocuments(),
    Import.aggregate([{ $group: { _id: null, total: { $sum: "$errors" } } }]).then((r) => r[0]?.total || 0),
  ]);
  return NextResponse.json({ total, byStatus, byWard, activity, recentImports, importErrors });
}
