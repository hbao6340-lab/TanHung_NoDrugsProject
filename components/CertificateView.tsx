"use client";
import { forwardRef, useState } from "react";
import { CERTIFICATE_TEMPLATE_SRC, CERT_LAYOUT } from "@/lib/certificate";

export interface CertificateData {
  businessName: string;
  businessId: string;
  verificationNumber?: string;
  verifiedAt?: string;
  expiryDate?: string;
  qrDataUrl?: string;
}

function fmt(d?: string) {
  if (!d) return "";
  const t = new Date(d);
  return isNaN(t.getTime()) ? "" : t.toLocaleDateString("vi-VN");
}

/**
 * Full certificate rendering: template artwork + business name centered in the
 * middle band + QR in the bottom-left corner next to the "QR CHỨNG NHẬN" label.
 * Percentage geometry scales with the container; forward a ref for PNG export.
 */
export const CertificateView = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificateView({ data }, ref) {
    const [noTemplate, setNoTemplate] = useState(false);
    return (
      <div ref={ref} className="relative w-full overflow-hidden rounded-sm bg-[#f7f0dc]" style={{ aspectRatio: "3 / 2", containerType: "inline-size" }}>
        {!noTemplate ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={CERTIFICATE_TEMPLATE_SRC}
            alt="Mẫu giấy chứng nhận"
            className="absolute inset-0 h-full w-full"
            onError={() => setNoTemplate(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border-4 border-double border-yellow-700 p-6 text-center text-sm text-slate-600">
            Chưa có file mẫu chứng nhận — lưu ảnh mẫu tại <code>public/certificate-template.jpg</code>
          </div>
        )}
        {/* Business name — middle */}
        <div
          className="absolute text-center"
          style={{ top: CERT_LAYOUT.nameBlock.top, left: CERT_LAYOUT.nameBlock.left, width: CERT_LAYOUT.nameBlock.width }}
        >
          <p className="font-extrabold uppercase leading-tight text-[#0b3d91]" style={{ fontSize: "clamp(14px, 3.2cqw, 34px)" }}>
            {data.businessName}
          </p>
        </div>
        {/* Verification meta line */}
        {(data.verificationNumber || data.expiryDate) && (
          <div
            className="absolute text-center text-slate-700"
            style={{ top: CERT_LAYOUT.metaLine.top, left: CERT_LAYOUT.metaLine.left, width: CERT_LAYOUT.metaLine.width, fontSize: "clamp(8px, 1.5cqw, 15px)" }}
          >
            {data.verificationNumber && <span>Số xác minh: <b>{data.verificationNumber}</b></span>}
            {data.verificationNumber && data.expiryDate && <span> — </span>}
            {data.expiryDate && <span>Hiệu lực đến {fmt(data.expiryDate)}</span>}
          </div>
        )}
        {/* QR — bottom-left next to "QR CHỨNG NHẬN" */}
        {data.qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.qrDataUrl}
            alt={`QR xác minh ${data.businessId}`}
            className="absolute bg-white p-[0.5%]"
            style={{ left: CERT_LAYOUT.qr.left, bottom: CERT_LAYOUT.qr.bottom, width: CERT_LAYOUT.qr.width }}
          />
        )}
      </div>
    );
  }
);
