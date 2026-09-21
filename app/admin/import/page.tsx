"use client";
import { useState } from "react";
export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  async function doPreview() {
    if (!file) return; setLoading(true);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/import/preview", { method: "POST", body: fd });
    const d = await r.json(); setPreview(d); setLoading(false);
  }
  async function confirm() {
    const r = await fetch("/api/import/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: preview.token }) });
    const d = await r.json(); alert(d.message || "Hoàn tất"); setPreview(null);
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Nhập Excel</h1>
      <p className="text-sm text-slate-600">Hỗ trợ .xlsx, .xls, .csv. Dữ liệu chỉ ghi vào DB sau khi XÁC NHẬN preview.</p>
      <div className="mt-4 flex gap-2">
        <a href="/api/export?template=1" className="rounded border px-4 py-2 text-sm">Tải template mẫu</a>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] || null); }}
        className="mt-4 rounded-lg border-2 border-dashed p-8 text-center"
      >
        <input type="file" accept=".xlsx,.xls,.csv" aria-label="Chọn file Excel" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {file && <p className="mt-2 text-sm">Đã chọn: {file.name}</p>}
        <button onClick={doPreview} disabled={!file || loading} className="mt-4 rounded bg-blue-900 px-6 py-2 text-white disabled:opacity-50">{loading ? "Đang phân tích…" : "Phân tích & Xem trước"}</button>
      </div>
      {preview && (
        <div className="mt-6 rounded border bg-white p-5">
          <h2 className="text-lg font-bold">IMPORT PREVIEW</h2>
          <p className="text-sm">Total: {preview.summary.total} | New: {preview.summary.new} | Updated: {preview.summary.updated} | Unchanged: {preview.summary.unchanged} | Errors: {preview.summary.errors}</p>
          <div className="mt-3 max-h-96 space-y-2 overflow-auto text-sm">
            {preview.rows.filter((r: any) => r.action !== "IGNORE").slice(0, 100).map((r: any, i: number) => (
              <div key={i} className="rounded border p-2">
                <span className="font-semibold">Dòng {r.rowNumber}</span> — <span className="rounded bg-slate-100 px-2">{r.action}</span>
                {r.errors?.map((e: string, j: number) => <p key={j} className="text-red-700">{e}</p>)}
                {r.changes?.map((c: any, j: number) => <p key={j}>{c.field}: {c.from} → <b>{c.to}</b></p>)}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setPreview(null)} className="rounded border px-5 py-2">CANCEL</button>
            <button onClick={confirm} disabled={preview.summary.errors > 0 && preview.summary.new + preview.summary.updated === 0} className="rounded bg-green-700 px-5 py-2 text-white">CONFIRM IMPORT</button>
          </div>
        </div>
      )}
    </div>
  );
}
