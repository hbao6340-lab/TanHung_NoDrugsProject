import type { BusinessStatus } from "@/types";

/** Template image (user-supplied). Save the certificate background as this file. */
export const CERTIFICATE_TEMPLATE_SRC = "/certificate-template.jpg";

/** Only VERIFIED businesses are issued a certificate + QR. */
export function canIssueCertificate(status: BusinessStatus | string | undefined): boolean {
  return status === "VERIFIED";
}

/**
 * Overlay geometry, in % of the certificate container (3:2 landscape, matching
 * the template). Tune here if the template artwork shifts.
 */
export const CERT_LAYOUT = {
  /** Business name block: just below the blue subtitle, above the emblem. */
  nameBlock: { top: "42%", left: "15%", width: "70%" },
  /** Verification meta line under the name. */
  metaLine: { top: "50%", left: "15%", width: "70%" },
  /** QR code: bottom-left, LEFT of the "QR CHỨNG NHẬN" label. */
  qr: { left: "3%", bottom: "4.5%", width: "10.5%" },
} as const;
