import { dbConnect } from "./db";
import AuditLog from "@/models/AuditLog";

export async function writeAudit(entry: {
  user?: string;
  username?: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: unknown;
  ip?: string;
  userAgent?: string;
}) {
  try {
    await dbConnect();
    await AuditLog.create(entry);
  } catch (e) {
    console.error("audit write failed", e);
  }
}
