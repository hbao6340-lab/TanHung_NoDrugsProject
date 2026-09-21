"use client";
import { useState } from "react";
export default function ExportPage() {
  const [status, setStatus] = useState(""); const [ward, setWard] = useState("");
  function go() {
    const p = new URLSearchParams({ status, ward });
    window.location.href = `/api/export?${p}`;
  }
  return (
    <div><h1 className="text-2xl font-bold">Xuất Excel</h1>
      <div className="mt-4 flex flex-wrap gap-2 rounded border bg-white p-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-3 py-2" aria-label="Trạng thái"><option value="">Tất cả trạng thái</option><option>VERIFIED</option><option>NEEDS_CORRECTION</option><option>NOT_VERIFIED</option><option>EXPIRED</option><option>SUSPENDED</option></select>
        <input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Phường…" className="rounded border px-3 py-2" aria-label="Phường" />
        <button onClick={go} className="rounded bg-blue-900 px-5 py-2 text-white">Xuất .xlsx</button>
      </div></div>
  );
}
