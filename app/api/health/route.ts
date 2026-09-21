import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import mongoose from "mongoose";
import dns from "node:dns";

// Public, unauthenticated deployment check for Vercel.
// Returns { ok, db } without leaking credentials or internals.
export const dynamic = "force-dynamic";

export async function GET() {
  let db: string = "down";
  try {
    await dbConnect();
    db = mongoose.connection.readyState === 1 ? "up" : "down";
  } catch (e) {
    // Server-side only: never sent to the client.
    const raw = e instanceof Error ? e.message : String(e);
    const pw = process.env.MONGODB_URI?.match(/:\/\/[^:]+:([^@]+)@/)?.[1];
    console.error("[health] db unreachable:", pw ? raw.split(pw).join("***") : raw);
    db = "down";
  }
  const status = db === "up" ? 200 : 503;
  return NextResponse.json(
    { ok: db === "up", db, time: new Date().toISOString(), dns: dns.getServers() },
    { status }
  );
}
