/**
 * Storage abstraction so the provider can be swapped without touching models.
 *
 * - Local dev (no BLOB token): returns a logical `/uploads/...` URL.
 * - Vercel (BLOB_READ_WRITE_TOKEN set + @vercel/blob installed): uploads to
 *   Vercel Blob and returns the public URL. No filesystem writes, so it works
 *   on Vercel's ephemeral serverless filesystem.
 * - S3-compatible: wire STORAGE_ENDPOINT/KEYS here later behind the same interface.
 */
export interface StorageProvider {
  save(filename: string, data: Buffer, mime: string): Promise<{ url: string }>;
}

class LocalStorage implements StorageProvider {
  async save(filename: string, _data: Buffer, _mime: string) {
    return { url: `/uploads/${filename}` };
  }
}

class VercelBlobStorage implements StorageProvider {
  async save(filename: string, data: Buffer, mime: string) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`certificates/${filename}`, data, {
      access: "public",
      contentType: mime,
      addRandomSuffix: true,
    });
    return { url: blob.url };
  }
}

export function getStorage(): StorageProvider {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new VercelBlobStorage();
  return new LocalStorage();
}

/** True when uploads persist beyond the request (Blob/S3), false for local stub. */
export function isPersistentStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.STORAGE_ENDPOINT);
}
