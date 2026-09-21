import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { ShieldCheck, QrCode, Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b bg-blue-950 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-blue-950 font-bold" aria-hidden="true">✓</div>
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-200">Hệ thống chính thức</p>
            <h1 className="text-lg font-bold">Cổng xác minh cơ sở kinh doanh</h1>
          </div>
          <nav className="ml-auto flex gap-3 text-sm">
            <Link href="/search" className="underline">Tra cứu</Link>
            <Link href="/login" className="underline">Đăng nhập</Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-blue-900" aria-hidden="true" />
        <h2 className="text-3xl font-extrabold text-blue-950 md:text-4xl">TRA CỨU XÁC MINH CƠ SỞ KINH DOANH</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Kiểm tra thông tin xác minh của cơ sở kinh doanh trong hệ thống chính thức.</p>
        <div className="mt-8 flex justify-center"><SearchBox autofocus /></div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 text-left md:grid-cols-2">
          <div className="rounded-lg border p-5">
            <QrCode className="h-6 w-6 text-blue-900" aria-hidden="true" />
            <h3 className="mt-2 font-bold">Xác minh bằng QR</h3>
            <p className="text-sm text-slate-600">Quét mã QR trên chứng nhận để mở trang xác minh dạng /v/TH-2026-00001. Không cần đăng nhập.</p>
          </div>
          <div className="rounded-lg border p-5">
            <ShieldCheck className="h-6 w-6 text-blue-900" aria-hidden="true" />
            <h3 className="mt-2 font-bold">Thông điệp chính thức</h3>
            <p className="text-sm text-slate-600">Thông tin này được tra cứu từ hệ thống xác minh chính thức. Liên hệ cơ quan quản lý khi có sai lệch.</p>
          </div>
        </div>
      </section>
      <footer className="border-t py-6 text-center text-sm text-slate-500">©2026 Cổng Thông Tin Xác Minh Phường Tân Hưng</footer>
    </main>
  );
}
