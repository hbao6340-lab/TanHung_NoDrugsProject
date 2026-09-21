export const PERMISSIONS = {
  ADMIN: ["*"],
  STAFF: ["business:read", "business:create", "business:update", "import", "export", "qr", "certificate"],
  VIEWER: ["business:read", "dashboard:read", "import:read"],
} as const;

export function can(role: string, perm: string): boolean {
  if (role === "ADMIN") return true;
  const list = (PERMISSIONS as Record<string, readonly string[]>)[role] || [];
  return (list as readonly string[]).includes(perm);
}
