import { getGreenPointsSummary } from "@/lib/services/green-points";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getGreenPointsSummary();
  return Response.json(summary);
}
