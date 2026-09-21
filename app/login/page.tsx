"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (res.ok) router.push("/admin");
    else { const d = await res.json(); setErr(d.error || "Đăng nhập thất bại"); }
  }
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-blue-950">Đăng nhập quản trị</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label htmlFor="u" className="text-sm font-semibold">Tên đăng nhập</label>
          <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" autoComplete="username" /></div>
        <div><label htmlFor="p" className="text-sm font-semibold">Mật khẩu</label>
          <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" autoComplete="current-password" /></div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="w-full rounded bg-blue-900 py-2.5 font-semibold text-white">Đăng nhập</button>
      </form>
    </main>
  );
}
