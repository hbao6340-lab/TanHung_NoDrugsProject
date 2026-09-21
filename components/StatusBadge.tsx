import type { BusinessStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
export function StatusBadge({ status, size = "md" }: { status: BusinessStatus; size?: "sm" | "md" | "lg" }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      role="status"
      aria-label={c.label}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-semibold",
        c.badgeClass,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "lg" && "text-lg px-5 py-3"
      )}
    >
      <span aria-hidden="true" className="font-bold">{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}
