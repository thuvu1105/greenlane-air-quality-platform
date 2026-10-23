import { HCMC_BOUNDS } from "@/lib/geo";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Proxies OpenStreetMap Nominatim so the API key-free geocoder is called
// server-side with a proper User-Agent, and results stay scoped to HCMC.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  const viewbox = `${HCMC_BOUNDS.minLng},${HCMC_BOUNDS.maxLat},${HCMC_BOUNDS.maxLng},${HCMC_BOUNDS.minLat}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=vn&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(
    `${q}, Hồ Chí Minh`,
  )}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: { "User-Agent": "GreenLane-Demo/1.0 (contact: demo@greenlane.app)" },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Nominatim status ${res.status}`);
    const data = (await res.json()) as NominatimResult[];

    const results = data.map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    }));

    return Response.json({ results });
  } catch (error) {
    console.error("GET /api/geocode failed", error);
    return Response.json({ results: [], error: "Dịch vụ tìm kiếm địa điểm tạm thời không khả dụng." }, { status: 200 });
  }
}
