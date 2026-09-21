import { z } from "zod";

export const businessSchema = z.object({
  businessId: z.string().regex(/^TH-\d{4}-\d{5}$/, "Business ID phải có dạng TH-2026-00001"),
  businessName: z.string().min(2, "Tên cơ sở tối thiểu 2 ký tự").max(300),
  businessType: z.string().max(200).optional().default(""),
  addressLine: z.string().max(500).optional().default(""),
  ward: z.string().max(200).optional().default(""),
  district: z.string().max(200).optional().default(""),
  city: z.string().max(200).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  taxCode: z.string().max(50).optional().default(""),
  status: z.enum(["VERIFIED", "NEEDS_CORRECTION", "NOT_VERIFIED", "EXPIRED", "SUSPENDED"]),
  verificationNumber: z.string().max(100).optional().default(""),
  verifiedAt: z.string().optional().default(""),
  expiryDate: z.string().optional().default(""),
  certificateNumber: z.string().max(100).optional().default(""),
  certificateFileUrl: z.string().max(1000).optional().default(""),
  visible: z.boolean().default(true),
  showAddress: z.boolean().default(true),
  showPhone: z.boolean().default(false),
  showCertificate: z.boolean().default(true),
  internalNotes: z.string().max(5000).optional().default(""),
});
export type BusinessFormInput = z.infer<typeof businessSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Nhập tên đăng nhập"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

export const userSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
  active: z.boolean().default(true),
});
