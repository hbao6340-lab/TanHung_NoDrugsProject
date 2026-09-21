import mongoose, { Schema } from "mongoose";
const ImportSchema = new Schema(
  {
    filename: { type: String, required: true },
    uploadedBy: { type: String, default: "" },
    username: { type: String, default: "" },
    totalRows: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    unchanged: { type: Number, default: 0 },
    errors: { type: Number, default: 0 },
    status: { type: String, enum: ["PREVIEW", "CONFIRMED", "CANCELLED", "FAILED"], default: "PREVIEW" },
    // Vercel-safe import handshake: preview rows persist in MongoDB (serverless
    // functions share no in-memory state), confirm looks the batch up by token.
    token: { type: String, default: "", index: true },
    rawRows: { type: Array, default: [] },
    errorReport: { type: Array, default: [] },
    preview: { type: Array, default: [] },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);
export default mongoose.models.Import || mongoose.model("Import", ImportSchema);
