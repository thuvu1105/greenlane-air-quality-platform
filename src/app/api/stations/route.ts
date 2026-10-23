import { listStations } from "@/lib/services/stations";
import type { DataFreshness } from "@/lib/types";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minPm25 = searchParams.get("minPm25");
    const maxPm25 = searchParams.get("maxPm25");
    const freshness = searchParams.get("freshness") as DataFreshness | "all" | null;
    const sourceType = searchParams.get("sourceType") as "simulated" | "estimated" | "measured" | "all" | null;

    const stations = await listStations({
      minPm25: minPm25 ? Number(minPm25) : undefined,
      maxPm25: maxPm25 ? Number(maxPm25) : undefined,
      freshness: freshness ?? "all",
      sourceType: sourceType ?? "all",
    });

    return Response.json({ stations, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("GET /api/stations failed", error);
    return Response.json({ error: "Không thể tải dữ liệu điểm đo." }, { status: 500 });
  }
}
