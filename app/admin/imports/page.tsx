"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function ImportsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch("/api/imports").then((r) => r.json()).then((d) => setItems(d.items || [])); }, []);
  return (
    <div><h1 className="text-2xl font-bold">Lịch sử nhập</h1>
      <div className="mt-4 overflow-x-auto rounded border bg-white"><table className="w-full text-sm">
        <thead className="bg-slate-100"><tr><th className="p-2 text-left">File</th><th className="p-2">Ngày</th><th className="p-2">Total</th><th className="p-2">Created</th><th className="p-2">Updated</th><th className="p-2">Errors</th><th className="p-2">Status</th></tr></thead>
        <tbody>{items.map((i) => <tr key={i._id} className="border-t"><td className="p-2"><Link className="underline" href={`/admin/imports/${i._id}`}>{i.filename}</Link></td><td className="p-2">{new Date(i.createdAt).toLocaleString("vi-VN")}</td><td className="p-2 text-center">{i.totalRows}</td><td className="p-2 text-center">{i.created}</td><td className="p-2 text-center">{i.updated}</td><td className="p-2 text-center">{i.errors}</td><td className="p-2 text-center">{i.status}</td></tr>)}</tbody>
      </table></div></div>
  );
}
