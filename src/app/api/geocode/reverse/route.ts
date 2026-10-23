import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Reverse geocoding proxy (OpenStreetMap Nominatim) used only when the user
// explicitly taps "Dùng vị trí hiện tại" and grants browser geolocation
// permission. GreenLane never reads location in the background.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) {
    return Response.json({ error: "Thiếu tọa độ." }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: { "User-Agent": "GreenLane-Demo/1.0 (contact: demo@greenlane.app)" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Nominatim status ${res.status}`);
    const data = (await res.json()) as { display_name?: string };
    return Response.json({ label: data.display_name ?? `${lat}, ${lng}` });
  } catch (error) {
    console.error("GET /api/geocode/reverse failed", error);
    return Response.json({ label: `${lat}, ${lng}` });
  }
}
