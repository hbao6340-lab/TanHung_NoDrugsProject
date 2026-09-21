// Deprecated: import preview batches are persisted in MongoDB (imports
// collection, `token` + `rawRows`) so preview → confirm works across Vercel's
// stateless serverless functions. This module is kept only so old imports fail
// loudly instead of silently. Do not use for new code.
export function getPendingStore(): never {
  throw new Error("In-memory import store is disabled on serverless; use the Import model token handshake.");
}
