import { dbConnect } from "@/lib/db";
import Business from "@/models/Business";
import { BusinessForm } from "@/components/BusinessForm";
import { notFound } from "next/navigation";
export default async function EditBusiness({ params }: { params: { id: string } }) {
  await dbConnect();
  const b = await Business.findById(params.id).lean() as any;
  if (!b) return notFound();
  const initial = {
    businessId: b.businessId, businessName: b.businessName, businessType: b.businessType,
    addressLine: b.address?.addressLine, ward: b.address?.ward, district: b.address?.district, city: b.address?.city,
    phone: b.phone, email: b.email, taxCode: b.taxCode, status: b.status,
    verificationNumber: b.verification?.verificationNumber,
    verifiedAt: b.verification?.verifiedAt ? new Date(b.verification.verifiedAt).toISOString().slice(0, 10) : "",
    expiryDate: b.verification?.expiryDate ? new Date(b.verification.expiryDate).toISOString().slice(0, 10) : "",
    certificateNumber: b.certificate?.certificateNumber, certificateFileUrl: b.certificate?.fileUrl,
    visible: b.publicVisibility?.visible, showAddress: b.publicVisibility?.showAddress,
    showPhone: b.publicVisibility?.showPhone, showCertificate: b.publicVisibility?.showCertificate,
    internalNotes: b.internalNotes,
  };
  return <div><h1 className="mb-4 text-2xl font-bold">Sửa: {b.businessId}</h1><BusinessForm id={params.id} initial={initial as any} /></div>;
}
