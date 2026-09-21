"use client";
import { useEffect, useState } from "react";
export default function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ username: "", password: "", role: "VIEWER" });
  async function load() { const r = await fetch("/api/admin/users"); const d = await r.json(); setItems(d.items || []); }
  useEffect(() => { load(); }, []);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ username: "", password: "", role: "VIEWER" }); load();
  }
  async function toggle(u: any) {
    await fetch(`/api/admin/users/${u._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) }); load();
  }
  async function reset(u: any) {
    const pw = prompt("Mật khẩu mới (≥6 ký tự):"); if (!pw) return;
    await fetch(`/api/admin/users/${u._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) }); alert("Đã reset");
  }
  return (
    <div><h1 className="text-2xl font-bold">Người dùng</h1>
      <form onSubmit={create} className="mt-4 flex flex-wrap gap-2 rounded border bg-white p-4">
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="rounded border px-3 py-2" aria-label="Username" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="rounded border px-3 py-2" aria-label="Password" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded border px-3 py-2" aria-label="Role"><option>ADMIN</option><option>STAFF</option><option>VIEWER</option></select>
        <button className="rounded bg-blue-900 px-4 py-2 text-white">Tạo user</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded border bg-white"><table className="w-full text-sm">
        <thead className="bg-slate-100"><tr><th className="p-2 text-left">Username</th><th className="p-2">Role</th><th className="p-2">Active</th><th className="p-2">Last login</th><th className="p-2">Thao tác</th></tr></thead>
        <tbody>{items.map((u) => <tr key={u._id} className="border-t"><td className="p-2">{u.username}</td><td className="p-2 text-center">{u.role}</td><td className="p-2 text-center">{u.active ? "Yes" : "No"}</td><td className="p-2">{u.lastLogin ? new Date(u.lastLogin).toLocaleString("vi-VN") : "-"}</td>
          <td className="space-x-2 p-2 text-center"><button className="underline" onClick={() => toggle(u)}>{u.active ? "Deactivate" : "Activate"}</button><button className="underline" onClick={() => reset(u)}>Reset PW</button></td></tr>)}</tbody>
      </table></div></div>
  );
}
