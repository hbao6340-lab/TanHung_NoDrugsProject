"use client";
import { useEffect, useState } from "react";
export default function AuditPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/audit?limit=100").then((r) => r.json()).then((d) => setItems(d.items || [])); }, []);
  return (
    <div><h1 className="text-2xl font-bold">Nhật ký kiểm toán</h1>
      <div className="mt-4 overflow-x-auto rounded border bg-white"><table className="w-full text-sm">
        <thead className="bg-slate-100"><tr><th className="p-2 text-left">Time</th><th className="p-2">User</th><th className="p-2">Action</th><th className="p-2">Entity</th><th className="p-2">IP</th></tr></thead>
        <tbody>{items.map((a) => <tr key={a._id} className="border-t"><td className="p-2">{new Date(a.createdAt).toLocaleString("vi-VN")}</td><td className="p-2">{a.username}</td><td className="p-2">{a.action}</td><td className="p-2">{a.entity}:{a.entityId}</td><td className="p-2">{a.ip}</td></tr>)}</tbody>
      </table></div></div>
  );
}
