import { listSavedRoutes, saveRoute } from "@/lib/services/saved-routes";
import { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const pointSchema = z.object({ label: z.string().min(1), lat: z.number(), lng: z.number() });
const routeSchema = z.object({
  id: z.string(),
  routeType: z.enum(["fastest", "cleaner", "balanced"]),
  name: z.string(),
  path: z.array(z.tuple([z.number(), z.number()])),
  distanceKm: z.number(),
  durationMin: z.number(),
  extraTimeMin: z.number(),
  pm25Estimate: z.number().nullable(),
  pm25SampleCount: z.number(),
  confidence: z.enum(["high", "medium", "low"]),
  score: z.number(),
  isRecommended: z.boolean(),
  explanation: z.string(),
  provider: z.enum(["osrm", "fallback-simulated"]),
});

const saveSchema = z.object({ start: pointSchema, end: pointSchema, route: routeSchema });

export async function GET() {
  const routes = await listSavedRoutes();
  return Response.json({ routes });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Không thể lưu tuyến đường: dữ liệu không hợp lệ." }, { status: 400 });
    }
    const saved = await saveRoute(parsed.data.start, parsed.data.end, parsed.data.route);
    return Response.json({ route: saved });
  } catch (error) {
    console.error("POST /api/routes/saved failed", error);
    return Response.json({ error: "Không thể lưu tuyến đường." }, { status: 500 });
  }
}
