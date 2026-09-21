import { StatusBadge } from "@/components/StatusBadge";
import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";

// Always render live from MongoDB (never statically prerender without DB env).
export const dynamic = "force-dynamic";

async function getPublicBusiness(id: string) {
  await dbConnect();
  const b = (await Business.findOne({ businessId: id }).lean()) as any;
  if (!b || b.publicVisibility?.visible === false) return null;
  const vis = b.publicVisibility || {};
  return {
    businessId: b.businessId,
    businessName: b.businessName,
    status: b.status,
    verificationNumber: b.verification?.verificationNumber,
    verifiedAt: b.verification?.verifiedAt,
    expiryDate: b.verification?.expiryDate,
    addressLine: vis.showAddress === false ? undefined : b.address?.addressLine,
    ward: vis.showAddress === false ? undefined : b.address?.ward,
    district: vis.showAddress === false ? undefined : b.address?.district,
    city: vis.showAddress === false ? undefined : b.address?.city,
    phone: vis.showPhone ? b.phone : undefined,
    certificateNumber: b.certificate?.certificateNumber,
    certificateFileUrl: vis.showCertificate === false ? undefined : b.certificate?.fileUrl,
    updatedAt: b.updatedAt,
  };
}

export default async function VerifyPage({ params }: { params: { businessId: string } }) {
  let data: Awaited<ReturnType<typeof getPublicBusiness>>;
  try {
    data = await getPublicBusiness(params.businessId);
  } catch {
    data = null;
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">KHÔNG TÌM THẤY THÔNG TIN XÁC MINH</h1>
        <p className="mt-2 text-slate-600">Mã cơ sở không tồn tại trong hệ thống công khai.</p>
        <a href="/" className="mt-6 inline-block rounded bg-blue-900 px-6 py-3 text-white">Về trang chủ</a>
      </main>
    );
  }
  const b = data;
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-center text-xs uppercase tracking-widest text-slate-500">Hệ thống xác minh chính thức</p>
      <h1 className="mt-1 text-center text-2xl font-extrabold text-blue-950">XÁC MINH CƠ SỞ KINH DOANH</h1>
      <div className="mt-6 rounded-xl border-2 border-blue-950 p-6 text-center">
        <StatusBadge status={b.status} size="lg" />
        <h2 className="mt-4 text-xl font-bold">{b.businessName}</h2>
        <p className="text-sm text-slate-500">{b.businessId}</p>
        <dl className="mt-6 space-y-2 text-left text-sm">
          {b.verificationNumber && <div className="flex justify-between border-b py-2"><dt>Số xác minh</dt><dd className="font-semibold">{b.verificationNumber}</dd></div>}
          {b.verifiedAt && <div className="flex justify-between border-b py-2"><dt>Ngày cấp</dt><dd>{new Date(b.verifiedAt).toLocaleDateString("vi-VN")}</dd></div>}
          {b.expiryDate && <div className="flex justify-between border-b py-2"><dt>Ngày hết hạn</dt><dd>{new Date(b.expiryDate).toLocaleDateString("vi-VN")}</dd></div>}
          {b.addressLine && <div className="flex justify-between border-b py-2"><dt>Địa chỉ</dt><dd className="text-right">{b.addressLine}{b.ward ? `, ${b.ward}` : ""}</dd></div>}
          {b.certificateFileUrl && <div className="flex justify-between border-b py-2"><dt>Chứng nhận</dt><dd><a className="text-blue-800 underline" href={b.certificateFileUrl}>Xem / Tải chứng nhận</a></dd></div>}
          <div className="flex justify-between border-b py-2"><dt>QR</dt><dd>✓ Đã xác minh qua QR</dd></div>
          <div className="flex justify-between py-2"><dt>Cập nhật</dt><dd>{new Date(b.updatedAt).toLocaleDateString("vi-VN")}</dd></div>
        </dl>
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">Thông tin này được tra cứu từ hệ thống xác minh chính thức.</p>
    </main>
  );
}
