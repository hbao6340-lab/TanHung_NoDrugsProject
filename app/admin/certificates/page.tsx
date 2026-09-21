"use client";
import { useEffect, useState } from "react";
export default function CertificatesPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch("/api/certificates").then((r) => r.json()).then((d) => setItems(d.items || [])); }, []);
  return (
    <div><h1 className="text-2xl font-bold">Chứng nhận</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((c) => (
          <div key={c._id} className="rounded border bg-white p-4 text-sm">
            <p className="font-bold">{c.businessId}</p><p>{c.certificateNumber}</p>
            {c.fileUrl && <a className="text-blue-800 underline" href={c.fileUrl}>Tải chứng nhận</a>}
            {c.qrCodeUrl && <div><img src={c.qrCodeUrl} alt={`QR ${c.businessId}`} className="mt-2 h-28 w-28" /></div>}
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-500">Chưa có chứng nhận.</p>}
      </div></div>
  );
}
