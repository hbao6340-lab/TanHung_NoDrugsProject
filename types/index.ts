export type BusinessStatus = "VERIFIED" | "NEEDS_CORRECTION" | "NOT_VERIFIED" | "EXPIRED" | "SUSPENDED";
export type Role = "ADMIN" | "STAFF" | "VIEWER";

export interface PublicBusiness {
  businessId: string;
  businessName: string;
  businessType?: string;
  status: BusinessStatus;
  verificationNumber?: string;
  verifiedAt?: string;
  expiryDate?: string;
  ward?: string;
  district?: string;
  city?: string;
  addressLine?: string;
  phone?: string;
  certificateNumber?: string;
  certificateFileUrl?: string;
  updatedAt: string;
}
