import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="font-bold">Quản trị xác minh</Link>
          <nav className="hidden gap-4 text-sm md:flex" aria-label="Admin">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/businesses">Cơ sở</Link>
            <Link href="/admin/import">Nhập Excel</Link>
            <Link href="/admin/imports">Lịch sử nhập</Link>
            <Link href="/admin/export">Xuất Excel</Link>
            <Link href="/admin/certificates">Chứng nhận</Link>
            <Link href="/admin/users">Người dùng</Link>
            <Link href="/admin/audit">Nhật ký</Link>
            <Link href="/">Trang công khai</Link>
          </nav>
          <form action="/api/auth/logout" method="post" className="ml-auto">
            <button className="rounded border border-white/40 px-3 py-1 text-sm">Đăng xuất</button>
          </form>
        </div>
        <nav className="flex gap-4 overflow-x-auto px-4 pb-3 text-sm md:hidden" aria-label="Admin mobile">
          <Link href="/admin">Dashboard</Link><Link href="/admin/businesses">Cơ sở</Link>
          <Link href="/admin/import">Nhập</Link><Link href="/admin/imports">Lịch sử</Link>
          <Link href="/admin/export">Xuất</Link><Link href="/admin/users">Users</Link><Link href="/admin/audit">Logs</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
