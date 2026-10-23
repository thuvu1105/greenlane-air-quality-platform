import { deleteSavedRoute } from "@/lib/services/saved-routes";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
  }
  await deleteSavedRoute(numericId);
  return Response.json({ ok: true });
}
