import mongoose, { Schema } from "mongoose";

const BusinessSchema = new Schema(
  {
    businessId: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true },
    businessNameNormalized: { type: String, index: true },
    businessType: { type: String, default: "" },
    address: {
      addressLine: { type: String, default: "" },
      ward: { type: String, default: "", index: true },
      district: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    taxCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["VERIFIED", "NEEDS_CORRECTION", "NOT_VERIFIED", "EXPIRED", "SUSPENDED"],
      default: "NOT_VERIFIED",
      index: true,
    },
    verification: {
      verificationNumber: { type: String, default: "", sparse: true },
      verifiedAt: { type: Date },
      verifiedBy: { type: String, default: "" },
      expiryDate: { type: Date },
      lastReviewedAt: { type: Date },
    },
    certificate: {
      certificateId: { type: String, default: "" },
      certificateNumber: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
      qrCodeUrl: { type: String, default: "" },
    },
    publicVisibility: {
      visible: { type: Boolean, default: true },
      showAddress: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: false },
      showCertificate: { type: Boolean, default: true },
    },
    internalNotes: { type: String, default: "" },
    source: {
      type: { type: String, default: "manual" },
      importId: { type: Schema.Types.ObjectId, ref: "Import" },
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

BusinessSchema.index({ verificationNumber: 1 }, { sparse: true } as never);
BusinessSchema.index({ businessNameNormalized: "text", businessName: "text" } as never);

export default mongoose.models.Business || mongoose.model("Business", BusinessSchema);
