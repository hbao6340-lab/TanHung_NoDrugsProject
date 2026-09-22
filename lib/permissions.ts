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

/** Username of the untouchable master account (set MASTER_ADMIN_USERNAME). */
export function masterUsername(): string {
  return (process.env.MASTER_ADMIN_USERNAME || "").trim();
}
export function isMaster(username: string): boolean {
  const m = masterUsername();
  return m !== "" && username === m;
}

export interface SessionLike {
  sub: string;
  username: string;
  role: string;
}
export interface TargetLike {
  _id?: unknown;
  username: string;
}

/**
 * Server-side guard for user management. The master account cannot be
 * deleted, deactivated, demoted, or password-reset by anyone else (including
 * other ADMINs); nobody can delete their own account (prevents lockouts).
 * Returns null when allowed, otherwise { error, status }.
 */
export function checkUserModification(
  session: SessionLike,
  target: TargetLike,
  change: { role?: unknown; active?: unknown; password?: unknown; delete?: boolean }
): { error: string; status: 403 | 404 } | null {
  if (isMaster(target.username)) {
    if (change.delete) return { error: "Master account cannot be deleted", status: 403 };
    if (change.role !== undefined || change.active !== undefined)
      return { error: "Master account role/status is locked", status: 403 };
    if (change.password !== undefined && session.username !== target.username)
      return { error: "Only the master can change its own password", status: 403 };
    return null;
  }
  if (change.delete && String(target._id || "") === String(session.sub))
    return { error: "You cannot delete your own account", status: 403 };
  return null;
}
