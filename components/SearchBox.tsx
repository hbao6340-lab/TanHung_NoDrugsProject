"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export function SearchBox({ initial = "", autofocus = false }: { initial?: string; autofocus?: boolean }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2) router.replace(`/search?q=${encodeURIComponent(q.trim())}`);
    }, 400);
    return () => clearTimeout(t);
  }, [q, router]);
  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
      className="flex w-full max-w-2xl gap-2"
    >
      <label htmlFor="search-input" className="sr-only">Tìm kiếm cơ sở kinh doanh</label>
      <input
        id="search-input"
        value={q}
        autoFocus={autofocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nhập tên, mã cơ sở (TH-2026-00001) hoặc số xác minh…"
        className="flex-1 rounded-md border border-slate-300 px-4 py-3 text-base focus:border-blue-900"
      />
      <button type="submit" className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">
        Tra cứu
      </button>
    </form>
  );
}
