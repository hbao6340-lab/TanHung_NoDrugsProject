"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {}); }, []);
  if (!stats) return <p>Đang tải…</p>;
  const cards = [
    ["Tổng cơ sở", stats.total], ["Đã xác minh", stats.byStatus?.VERIFIED || 0],
    ["Cần khắc phục", stats.byStatus?.NEEDS_CORRECTION || 0], ["Không đạt", stats.byStatus?.NOT_VERIFIED || 0],
    ["Hết hiệu lực", stats.byStatus?.EXPIRED || 0], ["Tạm ngưng", stats.byStatus?.SUSPENDED || 0],
    ["Lượt nhập gần đây", stats.recentImports || 0], ["Lỗi nhập", stats.importErrors || 0],
  ];
  const pie = Object.entries(stats.byStatus || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ["#16a34a", "#f59e0b", "#dc2626", "#6b7280", "#ea580c"];
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k as string} className="rounded-lg border bg-white p-4"><p className="text-xs text-slate-500">{k}</p><p className="text-2xl font-bold">{v as number}</p></div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4"><h2 className="font-bold">Phân bố trạng thái</h2>
          <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={pie} dataKey="value" nameKey="name" label>{pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="rounded-lg border bg-white p-4"><h2 className="font-bold">Cơ sở theo phường</h2>
          <ResponsiveContainer width="100%" height={260}><BarChart data={stats.byWard || []}><XAxis dataKey="_id" fontSize={11} /><YAxis /><Tooltip /><Bar dataKey="count" fill="#1e3a8a" /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="mt-4 rounded-lg border bg-white p-4"><h2 className="font-bold">Hoạt động xác minh theo thời gian</h2>
        <ResponsiveContainer width="100%" height={260}><LineChart data={stats.activity || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" fontSize={11} /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#1e3a8a" /></LineChart></ResponsiveContainer></div>
    </div>
  );
}
