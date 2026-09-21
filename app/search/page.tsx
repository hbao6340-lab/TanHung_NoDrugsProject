"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { STATUS_CONFIG } from "@/lib/constants";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/public/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => r.json()).then((d) => setResults(d.results || [])).catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [q]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-900 underline">← Trang chủ</Link>
      <h1 className="mt-2 text-2xl font-bold">Kết quả tra cứu</h1>
      <div className="mt-4"><SearchBox initial={q} /></div>
      {loading && <p role="status" className="mt-6">Đang tìm kiếm…</p>}
      {!loading && q && results.length === 0 && <p className="mt-6 rounded border p-4">Không tìm thấy kết quả phù hợp.</p>}
      <ul className="mt-6 space-y-3">
        {results.map((b) => (
          <li key={b.businessId} className="rounded-lg border p-4 hover:border-blue-900">
            <Link href={`/v/${b.businessId}`} className="block">
              <span className="font-bold text-blue-950">{b.businessName}</span>
              <span className="ml-2 text-sm text-slate-500">{b.businessId}</span>
              <div className="mt-1 text-sm">
                <span className="mr-2 rounded border px-2 py-0.5">{(STATUS_CONFIG as any)[b.status]?.shortLabel || b.status}</span>
                {b.verificationNumber && <span className="mr-2">Số XN: {b.verificationNumber}</span>}
                {b.ward && <span>Phường: {b.ward}</span>}
              </div>
              <div className="text-xs text-slate-500">Cập nhật: {new Date(b.updatedAt).toLocaleDateString("vi-VN")}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8">Đang tải…</p>}>
      <SearchResults />
    </Suspense>
  );
}
