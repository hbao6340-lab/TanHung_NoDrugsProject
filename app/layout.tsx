import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "TRA CỨU XÁC MINH CƠ SỞ KINH DOANH", description: "Kiểm tra thông tin xác minh của cơ sở kinh doanh trong hệ thống chính thức." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
