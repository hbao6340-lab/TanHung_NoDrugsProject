"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function BusinessesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [ward, setWard] = useState("");
  const [page, setPage] = useState(1);
  async function load() {
    const p = new URLSearchParams({ q, status, ward, page: String(page), limit: "20" });
    const r = await fetch(`/api/businesses?${p}`); const d = await r.json(); setItems(d.items || []);
  }
  useEffect(() => { load(); }, [page]);
  async function del(id: string) {
    if (!confirm("Xóa cơ sở này?")) return;
    await fetch(`/api/businesses/${id}`, { method: "DELETE" }); load();
  }
  async function qr(id: string) {
    const r = await fetch(`/api/businesses/${id}/qr`, { method: "POST" });
    const d = await r.json(); alert("QR: " + (d.qrUrl || d.qrDataUrl || "done"));
  }
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Quản lý cơ sở</h1>
        <Link href="/admin/businesses/new" className="rounded bg-blue-900 px-4 py-2 text-white">+ Tạo mới</Link></div>
      <form className="mt-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm…" className="rounded border px-3 py-2" aria-label="Tìm kiếm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-3 py-2" aria-label="Trạng thái">
          <option value="">Tất cả trạng thái</option><option>VERIFIED</option><option>NEEDS_CORRECTION</option><option>NOT_VERIFIED</option><option>EXPIRED</option><option>SUSPENDED</option>
        </select>
        <input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Phường…" className="rounded border px-3 py-2" aria-label="Phường" />
        <button className="rounded border px-4 py-2">Lọc</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-2 text-left">Mã</th><th className="p-2 text-left">Tên</th><th className="p-2">Trạng thái</th><th className="p-2">Phường</th><th className="p-2">Thao tác</th></tr></thead>
          <tbody>{items.map((b) => (
            <tr key={b._id} className="border-t"><td className="p-2">{b.businessId}</td><td className="p-2 font-semibold">{b.businessName}</td>
              <td className="p-2 text-center">{b.status}</td><td className="p-2">{b.address?.ward}</td>
              <td className="space-x-2 p-2 text-center">
                <Link className="underline" href={`/admin/businesses/${b._id}`}>Sửa</Link>
                <Link className="underline" href={`/v/${b.businessId}`}>Xem</Link>
                <button className="underline" onClick={() => qr(b._id)}>QR</button>
                <button className="text-red-700 underline" onClick={() => del(b._id)}>Xóa</button>
              </td></tr>))}</tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1">← Trước</button><span>Trang {page}</span><button onClick={() => setPage(page + 1)} className="rounded border px-3 py-1">Sau →</button></div>
    </div>
  );
}
