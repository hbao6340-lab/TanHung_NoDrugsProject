import { dbConnect } from "@/lib/db";
import Import from "@/models/Import";
import { notFound } from "next/navigation";
export default async function ImportDetail({ params }: { params: { id: string } }) {
  await dbConnect();
  const i = await Import.findById(params.id).lean() as any;
  if (!i) return notFound();
  return (
    <div><h1 className="text-2xl font-bold">{i.filename}</h1>
      <p className="text-sm text-slate-600">By {i.username} — {new Date(i.createdAt).toLocaleString("vi-VN")} — {i.status}</p>
      <p className="mt-2 text-sm">Total {i.totalRows} | Created {i.created} | Updated {i.updated} | Unchanged {i.unchanged} | Errors {i.errors}</p>
      <pre className="mt-4 max-h-[60vh] overflow-auto rounded bg-slate-900 p-4 text-xs text-green-200">{JSON.stringify(i.preview?.slice(0, 50) || i.errorReport?.slice(0, 50), null, 2)}</pre>
    </div>
  );
}
