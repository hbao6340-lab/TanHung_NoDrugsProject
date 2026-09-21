import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "STAFF", "VIEWER"], default: "VIEWER" },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);
export default mongoose.models.User || mongoose.model("User", UserSchema);
