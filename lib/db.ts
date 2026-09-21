import mongoose from "mongoose";
import dns from "node:dns";

if (process.env.DNS_SERVERS) {
  // Opt-in workaround for machines/networks where the system DNS refuses
  // direct queries (ISP hijacking, firewall, AV DNS filters). Example:
  // DNS_SERVERS=1.1.1.1,1.0.0.1
  try {
    dns.setServers(
      process.env.DNS_SERVERS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  } catch {
    // Fall through to system DNS.
  }
}

// Serverless-safe connection cache (required on Vercel: functions are
// ephemeral, so the client must be reused across invocations via globalThis).
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
const g = globalThis as unknown as { __mongoose?: Cached };
if (!g.__mongoose) g.__mongoose = { conn: null, promise: null };

export async function dbConnect() {
  const cached = g.__mongoose!;
  if (cached.conn) return cached.conn;
  // Read env lazily so `next build` on Vercel succeeds without DB env set.
  const uri = process.env.MONGODB_URI || "";
  const dbName = process.env.MONGODB_DB_NAME || "business_verification";
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName,
      // Fail fast on serverless instead of hanging the function.
      serverSelectionTimeoutMS: 8000,
      maxIdleTimeMS: 30000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
