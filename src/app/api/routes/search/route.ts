import { buildRouteAlternatives, scoreAndLabelRoutes } from "@/lib/services/routing";
import { logRouteSearch } from "@/lib/services/saved-routes";
import { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const pointSchema = z.object({
  label: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const searchSchema = z.object({
  start: pointSchema,
  end: pointSchema,
  preference: z.number().min(0).max(100),
  sensitiveMode: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Dữ liệu điểm đi/điểm đến không hợp lệ." }, { status: 400 });
    }
    const { start, end, preference, sensitiveMode } = parsed.data;

    const { candidates } = await buildRouteAlternatives(start, end);
    // Sensitive mode nudges effective preference toward "cleaner" without
    // removing user control entirely.
    const effectivePreference = sensitiveMode ? Math.min(100, preference + 20) : preference;
    const routes = scoreAndLabelRoutes(candidates, effectivePreference);

    const id = await logRouteSearch(start, end, preference, sensitiveMode, routes);

    return Response.json({
      id,
      routes,
      preference,
      sensitiveMode,
      generatedAt: new Date().toISOString(),
      disclaimer:
        "Tuyến đường được tính toán từ dịch vụ định tuyến OSRM/OpenStreetMap (hoặc phương án mô phỏng khi dịch vụ không khả dụng). Mức PM2.5 là ước tính dựa trên dữ liệu mô phỏng, không phải đo lường thời gian thực trên toàn tuyến.",
    });
  } catch (error) {
    console.error("POST /api/routes/search failed", error);
    return Response.json({ error: "Không thể tính toán tuyến đường lúc này." }, { status: 500 });
  }
}
