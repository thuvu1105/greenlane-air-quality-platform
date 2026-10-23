import { getTrendByDistrict } from "@/lib/services/trend";

export const dynamic = "force-dynamic";

export async function GET() {
  const series = await getTrendByDistrict();
  return Response.json({ series });
}
