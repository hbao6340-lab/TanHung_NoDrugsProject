import QRCode from "qrcode";

/** Resolve the public base URL on any host (local, Vercel preview/prod, custom domain). */
export function appBaseUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (explicit) return explicit;
  // Vercel injects VERCEL_URL (hostname without protocol) at runtime.
  const vercel = (process.env.VERCEL_URL || "").replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export function qrContentFor(businessId: string): string {
  // QR encodes the public verification URL only — never private data.
  return `${appBaseUrl()}/v/${businessId}`;
}
export async function generateQrDataUrl(businessId: string): Promise<string> {
  return QRCode.toDataURL(qrContentFor(businessId), { width: 512, margin: 2 });
}
