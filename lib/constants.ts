import { type BusinessStatus } from "@/types";

export const STATUS_CONFIG: Record<
  BusinessStatus,
  { label: string; shortLabel: string; icon: string; badgeClass: string; dotClass: string }
> = {
  VERIFIED: {
    label: "CƠ SỞ KINH DOANH KHÔNG MA TUÝ",
    shortLabel: "Đã xác minh",
    icon: "✓",
    badgeClass: "bg-green-100 text-green-800 border-green-300",
    dotClass: "bg-green-600",
  },
  NEEDS_CORRECTION: {
    label: "CƠ SỞ CÓ KHUYẾT ĐIỂM CẦN KHẮC PHỤC",
    shortLabel: "Cần khắc phục",
    icon: "!",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    dotClass: "bg-amber-500",
  },
  NOT_VERIFIED: {
    label: "CƠ SỞ KHÔNG ĐỦ TIÊU CHUẨN",
    shortLabel: "Không đạt",
    icon: "×",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    dotClass: "bg-red-600",
  },
  EXPIRED: {
    label: "CHỨNG NHẬN HẾT HIỆU LỰC",
    shortLabel: "Hết hiệu lực",
    icon: "◷",
    badgeClass: "bg-gray-200 text-gray-800 border-gray-400",
    dotClass: "bg-gray-500",
  },
  SUSPENDED: {
    label: "TẠM NGƯNG XÁC MINH",
    shortLabel: "Tạm ngưng",
    icon: "‖",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
    dotClass: "bg-orange-500",
  },
};

export const STATUSES: BusinessStatus[] = ["VERIFIED", "NEEDS_CORRECTION", "NOT_VERIFIED", "EXPIRED", "SUSPENDED"];

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Business Verification Portal";
