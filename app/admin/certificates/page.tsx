"use client";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { CertificateView } from "@/components/CertificateView";

interface Biz {
  _id: string;
  businessId: string;
  businessName: string;
  status: string;
  verification?: { verificationNumber?: string; verifiedAt?: string; expiryDate?: string };
  certificate?: { qrCodeUrl?: string };
}

function Card({ b, onChanged }: { b: Biz; onChanged: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function ensureQr(): Promise<string | null> {
    if (b.certificate?.qrCodeUrl) return b.certificate.qrCodeUrl;
    setBusy(true); setMsg("");
    try {
      const r = await fetch(`/api/businesses/${b._id}/qr`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || "Cấp QR thất bại"); return null; }
      onChanged();
      return d.qrDataUrl as string;
    } finally { setBusy(false); }
  }

  async function download() {
    const qr = await ensureQr();
    if (!qr && !b.certificate?.qrCodeUrl) return;
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `chung-nhan-${b.businessId}.png`;
      a.click();
    } catch {
      setMsg("Xuất PNG thất bại, hãy dùng chức năng In");
    } finally { setBusy(false); }
  }

  function print() {
    document.body.classList.add("printing-cert");
    ref.current?.closest("[data-cert-card]")?.classList.add("print-this");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-cert");
      ref.current?.closest("[data-cert-card]")?.classList.remove("print-this");
    }, 500);
  }

  const data = {
    businessName: b.businessName,
    businessId: b.businessId,
    verificationNumber: b.verification?.verificationNumber,
    verifiedAt: b.verification?.verifiedAt,
    expiryDate: b.verification?.expiryDate,
    qrDataUrl: b.certificate?.qrCodeUrl,
  };

  return (
    <div data-cert-card className="rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <div><span className="font-bold">{b.businessName}</span> <span className="text-slate-500">{b.businessId}</span></div>
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">VERIFIED</span>
      </div>
      <CertificateView ref={ref} data={data} />
      {msg && <p role="status" className="mt-2 text-sm text-red-700">{msg}</p>}
      <div className="no-print mt-3 flex flex-wrap gap-2">
        <button onClick={download} disabled={busy} className="rounded bg-blue-900 px-4 py-1.5 text-sm text-white disabled:opacity-50">
          {b.certificate?.qrCodeUrl ? "Tải chứng nhận (PNG)" : "Cấp QR & tải chứng nhận"}
        </button>
        <button onClick={print} className="rounded border px-4 py-1.5 text-sm">In</button>
        <a href={`/v/${b.businessId}`} className="rounded border px-4 py-1.5 text-sm underline">Trang xác minh</a>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const [items, setItems] = useState<Biz[]>([]);
  const [total, setTotal] = useState(0);
  async function load() {
    // Certificates exist for VERIFIED businesses only.
    const r = await fetch("/api/businesses?status=VERIFIED&limit=100");
    const d = await r.json();
    setItems(d.items || []);
    setTotal(d.total || 0);
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <style>{`@media print { body.printing-cert .no-print { display: none !important; } body.printing-cert [data-cert-card] { display: none !important; } body.printing-cert [data-cert-card].print-this { display: block !important; border: none; } }`}</style>
      <h1 className="text-2xl font-bold">Chứng nhận</h1>
      <p className="mt-1 text-sm text-slate-600">
        Giấy chứng nhận chỉ được cấp cho cơ sở trạng thái <b>VERIFIED</b> ({total} cơ sở).
        Các trạng thái khác không có chứng nhận.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {items.map((b) => <Card key={b._id} b={b} onChanged={load} />)}
      </div>
      {items.length === 0 && <p className="mt-4 text-slate-500">Chưa có cơ sở VERIFIED nào.</p>}
    </div>
  );
}
