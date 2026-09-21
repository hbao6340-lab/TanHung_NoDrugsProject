import mongoose, { Schema } from "mongoose";
const SettingSchema = new Schema(
  { key: { type: String, required: true, unique: true }, value: { type: Schema.Types.Mixed } },
  { timestamps: true }
);
export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
