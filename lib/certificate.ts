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
  /** Business name block: centered in the empty middle band. */
  nameBlock: { top: "38%", left: "15%", width: "70%" },
  /** Verification meta line under the name. */
  metaLine: { top: "52%", left: "15%", width: "70%" },
  /** QR code: bottom-left, right of the "QR CHỨNG NHẬN" label. */
  qr: { left: "23%", bottom: "4.5%", width: "11.5%" },
} as const;
