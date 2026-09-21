# Business Verification Portal

Public business verification + staff admin with MongoDB Atlas.

## Setup (local)
1. Copy `.env.example` to `.env.local` and set `MONGODB_URI` (MongoDB Atlas), `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
2. `npm install`
3. `npm run create-admin` — create initial ADMIN (interactive, no hardcoded creds)
4. `npm run seed` — sample businesses TH-2026-00001..03
5. `npm run dev`

## Routes
Public: `/`, `/search`, `/v/[businessId]` — no auth.
Admin: `/admin`, `/admin/businesses`, `/admin/import`, `/admin/imports`, `/admin/export`, `/admin/certificates`, `/admin/users`, `/admin/audit` — JWT cookie + middleware.

## Excel import
Upload → Parse → Validate → Match by business_id → Preview → Confirm → DB update + audit. Never auto-deletes missing rows. Duplicate business_id in file = error. Preview batches are stored in MongoDB (`imports` collection, token handshake), so preview → confirm works across stateless serverless functions.

## Security
bcrypt hashing, httpOnly cookies, server-side RBAC (ADMIN/STAFF/VIEWER), rate limits on search + login, sanitized queries, formula-injection sanitization on export, no secrets client-side.

## Deploy to Vercel (frontend + API, MongoDB Atlas as database)
1. Push this repo to GitHub.
2. MongoDB Atlas: create cluster → Database Access (db user + password) → Network Access → **Allow access from anywhere (0.0.0.0/0)** → Connect → Drivers → copy the `mongodb+srv://` URI.
3. Vercel: Import Project → Framework **Next.js** (auto-detected, `vercel.json` included) → add Environment Variables (Production + Preview):
   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Atlas `mongodb+srv://…` string |
   | `MONGODB_DB_NAME` | `business_verification` |
   | `AUTH_SECRET` | long random string (≥32 chars) |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` (or custom domain) |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token (Storage → Blob → Create) |
4. Deploy. Verify `https://<your-project>.vercel.app/api/health` returns `{"ok":true,"db":"up"}`.
5. SSH/run once locally with production URI: `npm run create-admin`, then `npm run seed` (optional sample data).
6. QR codes encode `{NEXT_PUBLIC_APP_URL}/v/{businessId}` — setting the URL before generating QRs keeps printed codes correct.

Notes:
- `vercel.json` raises `maxDuration` to 60s for import preview/confirm + export.
- File uploads persist via Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; without it the dev-only local stub is used (Vercel's filesystem is ephemeral).
- Every push to `main` redeploys automatically; use Preview deployments for testing.
