import { listRouteSearchHistory } from "@/lib/services/saved-routes";

export const dynamic = "force-dynamic";

export async function GET() {
  const history = await listRouteSearchHistory();
  return Response.json({ history });
}
