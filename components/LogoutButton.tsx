"use client";
import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Full navigation clears any cached admin UI and lands on the homepage.
      window.location.href = "/";
    }
  }
  return (
    <button
      onClick={logout}
      disabled={busy}
      className="rounded border border-white/40 px-3 py-1 text-sm disabled:opacity-60"
    >
      {busy ? "Đang đăng xuất…" : "Đăng xuất"}
    </button>
  );
}
