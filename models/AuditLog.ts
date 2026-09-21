import mongoose, { Schema } from "mongoose";
const AuditLogSchema = new Schema(
  {
    user: { type: String, default: "" },
    username: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    entity: { type: String, default: "" },
    entityId: { type: String, default: "" },
    changes: { type: Schema.Types.Mixed },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);
AuditLogSchema.index({ createdAt: -1 });
export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
