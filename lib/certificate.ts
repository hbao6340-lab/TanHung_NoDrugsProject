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
  nameBlock: { top: "44%", left: "15%", width: "70%" },
  /** Verification meta line under the name. */
  metaLine: { top: "52%", left: "15%", width: "70%" },
  /** QR code: bottom-left, LEFT of the "QR CHỨNG NHẬN" label — sized to match
      the reference QR printed on the right side of the template. */
  qr: { left: "5%", bottom: "8%", width: "7%" },
} as const;
