import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
/** Sanitize value to prevent CSV/Excel formula injection on export. */
export function sanitizeExcelValue(v: unknown): unknown {
  if (typeof v !== "string") return v;
  if (/^[=+\-@\t\r]/.test(v)) return "'" + v;
  return v;
}
export function sanitizeQuery(q: string): string {
  return q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 200);
}
