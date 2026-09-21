import mongoose, { Schema } from "mongoose";
const CertificateSchema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    certificateNumber: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    qrCodeUrl: { type: String, default: "" },
    uploadedBy: { type: String, default: "" },
  },
  { timestamps: true }
);
export default mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
