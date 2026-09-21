"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSchema, type BusinessFormInput } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BusinessForm({ initial, id }: { initial?: Partial<BusinessFormInput>; id?: string }) {
  const router = useRouter(); const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<BusinessFormInput>({
    resolver: zodResolver(businessSchema), defaultValues: { status: "NOT_VERIFIED", visible: true, showAddress: true, showCertificate: true, showPhone: false, ...initial } as any,
  });
  async function onSubmit(v: BusinessFormInput) {
    setErr("");
    const url = id ? `/api/businesses/${id}` : "/api/businesses";
    const res = await fetch(url, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    if (res.ok) router.push("/admin/businesses");
    else { const d = await res.json(); setErr(d.error || "Lưu thất bại"); }
  }
  const F = (n: keyof BusinessFormInput, label: string, type = "text") => (
    <div><label className="text-sm font-semibold">{label}</label>
      <input type={type} {...register(n as any)} className="mt-1 w-full rounded border px-3 py-2" />
      {(errors as any)[n] && <p role="alert" className="text-xs text-red-700">{(errors as any)[n]?.message}</p>}</div>
  );
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded border bg-white p-5 md:grid-cols-2">
      {F("businessId", "Mã cơ sở (TH-2026-00001)")}{F("businessName", "Tên cơ sở")}
      {F("businessType", "Loại hình")}{F("addressLine", "Địa chỉ")}
      {F("ward", "Phường")}{F("district", "Quận/Huyện")}{F("city", "Tỉnh/TP")}
      {F("phone", "Điện thoại")}{F("email", "Email")}{F("taxCode", "Mã số thuế")}
      <div><label className="text-sm font-semibold">Trạng thái</label>
        <select {...register("status")} className="mt-1 w-full rounded border px-3 py-2">
          <option value="VERIFIED">VERIFIED</option><option value="NEEDS_CORRECTION">NEEDS_CORRECTION</option>
          <option value="NOT_VERIFIED">NOT_VERIFIED</option><option value="EXPIRED">EXPIRED</option><option value="SUSPENDED">SUSPENDED</option>
        </select></div>
      {F("verificationNumber", "Số xác minh")}{F("verifiedAt", "Ngày cấp", "date")}{F("expiryDate", "Ngày hết hạn", "date")}
      {F("certificateNumber", "Số chứng nhận")}{F("certificateFileUrl", "URL chứng nhận")}
      <div className="md:col-span-2"><label className="text-sm font-semibold">Ghi chú nội bộ</label>
        <textarea {...register("internalNotes")} className="mt-1 w-full rounded border px-3 py-2" rows={3} /></div>
      <div className="flex flex-wrap gap-4 md:col-span-2 text-sm">
        <label><input type="checkbox" {...register("visible")} /> Hiển thị công khai</label>
        <label><input type="checkbox" {...register("showAddress")} /> Hiện địa chỉ</label>
        <label><input type="checkbox" {...register("showPhone")} /> Hiện SĐT</label>
        <label><input type="checkbox" {...register("showCertificate")} /> Hiện chứng nhận</label>
      </div>
      {err && <p role="alert" className="text-sm text-red-700 md:col-span-2">{err}</p>}
      <div className="md:col-span-2"><button className="rounded bg-blue-900 px-6 py-2.5 font-semibold text-white">Lưu</button></div>
    </form>
  );
}
