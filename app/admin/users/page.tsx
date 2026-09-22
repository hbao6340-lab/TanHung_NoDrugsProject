"use client";
import { useEffect, useState } from "react";
export default function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [me, setMe] = useState("");
  const [master, setMaster] = useState("");
  const [form, setForm] = useState({ username: "", password: "", role: "VIEWER" });
  const [msg, setMsg] = useState("");
  async function load() {
    const [u, m] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({})),
    ]);
    setItems(u.items || []);
    setMe(m.user?.username || "");
    setMaster((u as any).master || "");
  }
  useEffect(() => { load(); }, []);
  async function create(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Tạo thất bại"); return; }
    setForm({ username: "", password: "", role: "VIEWER" }); load();
  }
  async function call(id: string, body: any, okMsg: string) {
    setMsg("");
    const r = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? okMsg : (d.error || "Thao tác thất bại"));
    load();
  }
  async function toggle(u: any) { call(u._id, { active: !u.active }, "Đã cập nhật trạng thái"); }
  async function reset(u: any) {
    const pw = prompt("Mật khẩu mới (≥6 ký tự):"); if (!pw) return;
    call(u._id, { password: pw }, "Đã reset mật khẩu");
  }
  async function remove(u: any) {
    if (!confirm(`Xóa người dùng ${u.username}?`)) return;
    setMsg("");
    const r = await fetch(`/api/admin/users/${u._id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? "Đã xóa" : (d.error || "Xóa thất bại"));
    load();
  }
  return (
    <div><h1 className="text-2xl font-bold">Người dùng</h1>
      <p className="mt-1 text-sm text-slate-600">Tài khoản master ({master || "chưa cấu hình MASTER_ADMIN_USERNAME"}) không thể bị xóa, khóa, hạ quyền hay đổi mật khẩu bởi người khác.</p>
      <form onSubmit={create} className="mt-4 flex flex-wrap gap-2 rounded border bg-white p-4">
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="rounded border px-3 py-2" aria-label="Username" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="rounded border px-3 py-2" aria-label="Password" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded border px-3 py-2" aria-label="Role"><option>ADMIN</option><option>STAFF</option><option>VIEWER</option></select>
        <button className="rounded bg-blue-900 px-4 py-2 text-white">Tạo user</button>
      </form>
      {msg && <p role="status" className="mt-2 text-sm text-slate-700">{msg}</p>}
      <div className="mt-4 overflow-x-auto rounded border bg-white"><table className="w-full text-sm">
        <thead className="bg-slate-100"><tr><th className="p-2 text-left">Username</th><th className="p-2">Role</th><th className="p-2">Active</th><th className="p-2">Last login</th><th className="p-2">Thao tác</th></tr></thead>
        <tbody>{items.map((u) => {
          const isMaster = master !== "" && u.username === master;
          const locked = isMaster && me !== master;
          return <tr key={u._id} className="border-t"><td className="p-2">{u.username}{isMaster && <span className="ml-2 rounded bg-blue-950 px-2 py-0.5 text-xs text-white">Master</span>}{me === u.username && <span className="ml-2 text-xs text-slate-500">(bạn)</span>}</td><td className="p-2 text-center">{u.role}</td><td className="p-2 text-center">{u.active ? "Yes" : "No"}</td><td className="p-2">{u.lastLogin ? new Date(u.lastLogin).toLocaleString("vi-VN") : "-"}</td>
            <td className="space-x-2 p-2 text-center">
              <button className="underline disabled:text-slate-400" disabled={locked} onClick={() => toggle(u)}>{u.active ? "Deactivate" : "Activate"}</button>
              <button className="underline disabled:text-slate-400" disabled={locked} onClick={() => reset(u)}>Reset PW</button>
              <button className="text-red-700 underline disabled:text-slate-400" disabled={locked} onClick={() => remove(u)}>Xóa</button>
            </td></tr>;
        })}</tbody>
      </table></div></div>
  );
}
