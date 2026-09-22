"use client";
import { useEffect, useState } from "react";
export default function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [me, setMe] = useState("");
  const [master, setMaster] = useState("");
  const [form, setForm] = useState({ username: "", password: "", role: "STAFF", active: true });
  const [msg, setMsg] = useState("");
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
  const [showPw, setShowPw] = useState(false);
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
  function genPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
    let s = "";
    const buf = new Uint32Array(12);
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length; i++) s += chars[buf[i] % chars.length];
    setForm((f) => ({ ...f, password: s }));
    setShowPw(true);
  }
  async function create(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const errs: typeof formErrors = {};
    if (form.username.trim().length < 3) errs.username = "Tên đăng nhập tối thiểu 3 ký tự";
    if (form.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự";
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, username: form.username.trim() }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(d.error || "Tạo thất bại"); return; }
    setMsg(`Đã tạo tài khoản "${d.username}" với quyền ${d.role}`);
    setForm({ username: "", password: "", role: "STAFF", active: true });
    setShowPw(false);
    load();
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
      <form onSubmit={create} className="mt-4 rounded-lg border bg-white p-5" aria-labelledby="create-user-heading">
        <h2 id="create-user-heading" className="font-bold">Tạo tài khoản nhân viên mới</h2>
        <p className="mt-1 text-sm text-slate-600">Tài khoản mới có thể đăng nhập ngay. Quyền <b>STAFF</b>: quản lý cơ sở, nhập/xuất Excel, tạo QR. Quyền <b>ADMIN</b> thêm quản lý người dùng. <b>VIEWER</b> chỉ xem.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="new-username" className="text-sm font-semibold">Tên đăng nhập *</label>
            <input id="new-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="vd: nhanvien01" className="mt-1 w-full rounded border px-3 py-2" autoComplete="off" aria-invalid={!!formErrors.username} aria-describedby={formErrors.username ? "new-username-err" : undefined} />
            {formErrors.username && <p id="new-username-err" role="alert" className="mt-1 text-xs text-red-700">{formErrors.username}</p>}
          </div>
          <div>
            <label htmlFor="new-password" className="text-sm font-semibold">Mật khẩu * <span className="font-normal text-slate-500">(tối thiểu 6 ký tự)</span></label>
            <div className="mt-1 flex gap-2">
              <input id="new-password" type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Nhập hoặc tạo tự động" className="w-full rounded border px-3 py-2" autoComplete="new-password" aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? "new-password-err" : undefined} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="shrink-0 rounded border px-3 text-sm" aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPw ? "Ẩn" : "Hiện"}</button>
              <button type="button" onClick={genPassword} className="shrink-0 rounded border px-3 text-sm" title="Tạo mật khẩu ngẫu nhiên">Tạo</button>
            </div>
            {formErrors.password && <p id="new-password-err" role="alert" className="mt-1 text-xs text-red-700">{formErrors.password}</p>}
          </div>
          <div>
            <label htmlFor="new-role" className="text-sm font-semibold">Vai trò</label>
            <select id="new-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full rounded border px-3 py-2">
              <option value="STAFF">STAFF — quản lý cơ sở, Excel, QR</option>
              <option value="ADMIN">ADMIN — toàn quyền + quản lý người dùng</option>
              <option value="VIEWER">VIEWER — chỉ xem</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4" /> Kích hoạt ngay</label>
          </div>
        </div>
        <button className="mt-4 rounded bg-blue-900 px-6 py-2 font-semibold text-white">Tạo tài khoản</button>
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
