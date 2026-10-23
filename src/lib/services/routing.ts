import { haversineKm, pathLengthKm } from "@/lib/geo";
import { listStations } from "@/lib/services/stations";
import type { Confidence, LatLng, RouteOption, RoutePoint } from "@/lib/types";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const FETCH_TIMEOUT_MS = 6000;

interface OsrmRoute {
  geometry: { coordinates: [number, number][] }; // [lng, lat]
  distance: number; // meters
  duration: number; // seconds
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: { "User-Agent": "GreenLane-App-Demo" } });
  } finally {
    clearTimeout(timer);
  }
}

async function queryOsrm(start: LatLng, end: LatLng, waypoint?: LatLng): Promise<OsrmRoute[]> {
  const coordsParts = [
    `${start.lng},${start.lat}`,
    ...(waypoint ? [`${waypoint.lng},${waypoint.lat}`] : []),
    `${end.lng},${end.lat}`,
  ];
  const url = `${OSRM_BASE}/${coordsParts.join(";")}?overview=full&geometries=geojson&alternatives=${waypoint ? "false" : "true"}&steps=false`;
  const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  if (!res.ok) throw new Error(`OSRM responded with ${res.status}`);
  const data = (await res.json()) as { code: string; routes?: OsrmRoute[] };
  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("OSRM returned no routes");
  }
  return data.routes;
}

function toLatLngPath(route: OsrmRoute): [number, number][] {
  return route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

/** Builds a simple offset waypoint so we can ask OSRM for a distinct "detour" path. */
function perpendicularWaypoint(start: LatLng, end: LatLng, offsetKm: number, side: 1 | -1): LatLng {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const len = Math.hypot(dLat, dLng) || 1;
  // perpendicular unit vector
  const perpLat = (-dLng / len) * side;
  const perpLng = (dLat / len) * side;
  const kmToDegLat = offsetKm / 111;
  const kmToDegLng = offsetKm / (111 * Math.cos((midLat * Math.PI) / 180));
  return { lat: midLat + perpLat * kmToDegLat, lng: midLng + perpLng * kmToDegLng };
}

/** Deterministic fallback path generator used only when OSRM is unreachable. */
function simulateFallbackPath(start: LatLng, end: LatLng, bend: number): [number, number][] {
  const points: [number, number][] = [];
  const steps = 18;
  const waypoint = perpendicularWaypoint(start, end, bend, bend >= 0 ? 1 : -1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic Bezier through the offset waypoint for a plausible curved road-like path.
    const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * waypoint.lat + t * t * end.lat;
    const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * waypoint.lng + t * t * end.lng;
    points.push([lat, lng]);
  }
  return points;
}

interface PmEstimate {
  pm25: number | null;
  sampleCount: number;
  confidence: Confidence;
}

async function estimateRoutePm25(path: [number, number][]): Promise<PmEstimate> {
  const stations = await listStations();
  if (stations.length === 0 || path.length === 0) {
    return { pm25: null, sampleCount: 0, confidence: "low" };
  }

  // Sample ~12 evenly spaced points along the path.
  const sampleTargets = 12;
  const stride = Math.max(1, Math.floor(path.length / sampleTargets));
  const nearestReadings: number[] = [];
  const RADIUS_KM = 2.2;

  for (let i = 0; i < path.length; i += stride) {
    const point = path[i];
    let best: { dist: number; pm25: number } | null = null;
    for (const station of stations) {
      const dist = haversineKm(point, [station.lat, station.lng]);
      if (dist <= RADIUS_KM && (!best || dist < best.dist)) {
        best = { dist, pm25: station.pm25 };
      }
    }
    if (best) nearestReadings.push(best.pm25);
  }

  if (nearestReadings.length === 0) {
    // No nearby station coverage — fall back to the city-wide average as an estimate.
    const cityAvg = stations.reduce((sum, s) => sum + s.pm25, 0) / stations.length;
    return { pm25: Math.round(cityAvg * 10) / 10, sampleCount: 0, confidence: "low" };
  }

  const avg = nearestReadings.reduce((a, b) => a + b, 0) / nearestReadings.length;
  const confidence: Confidence = nearestReadings.length >= 5 ? "high" : nearestReadings.length >= 2 ? "medium" : "low";
  return { pm25: Math.round(avg * 10) / 10, sampleCount: nearestReadings.length, confidence };
}

function normalize(value: number, min: number, max: number): number {
  if (max - min < 1e-6) return 0;
  return (value - min) / (max - min);
}

export interface ScoredRouteInput {
  id: string;
  routeType: RouteOption["routeType"];
  name: string;
  path: [number, number][];
  distanceKm: number;
  durationMin: number;
  pm25Estimate: number | null;
  pm25SampleCount: number;
  confidence: Confidence;
  provider: RouteOption["provider"];
}

export async function buildRouteAlternatives(
  start: RoutePoint,
  end: RoutePoint,
): Promise<{ candidates: ScoredRouteInput[]; provider: "osrm" | "fallback-simulated" }> {
  let provider: "osrm" | "fallback-simulated" = "osrm";
  const rawRoutes: { path: [number, number][]; distanceKm: number; durationMin: number; provider: RouteOption["provider"] }[] = [];

  try {
    const osrmRoutes = await queryOsrm(start, end);
    for (const r of osrmRoutes.slice(0, 2)) {
      rawRoutes.push({
        path: toLatLngPath(r),
        distanceKm: Math.round((r.distance / 1000) * 10) / 10,
        durationMin: Math.round((r.duration / 60) * 10) / 10,
        provider: "osrm",
      });
    }

    if (rawRoutes.length < 2) {
      // Ask OSRM for a via-point detour so we always have a second, genuinely
      // different alternative to compare against.
      const waypoint = perpendicularWaypoint(start, end, 0.9, 1);
      try {
        const detour = await queryOsrm(start, end, waypoint);
        rawRoutes.push({
          path: toLatLngPath(detour[0]),
          distanceKm: Math.round((detour[0].distance / 1000) * 10) / 10,
          durationMin: Math.round((detour[0].duration / 60) * 10) / 10,
          provider: "osrm",
        });
      } catch {
        // ignore, fallback handled below if still short
      }
    }
  } catch {
    provider = "fallback-simulated";
  }

  if (rawRoutes.length === 0) {
    // Full fallback: synthesize two plausible paths.
    const directKm = haversineKm([start.lat, start.lng], [end.lat, end.lng]);
    const pathA = simulateFallbackPath(start, end, 0.4);
    const pathB = simulateFallbackPath(start, end, -1.1);
    const speedKmh = 28; // typical urban motorbike average speed assumption
    rawRoutes.push({
      path: pathA,
      distanceKm: Math.round(pathLengthKm(pathA) * 10) / 10 || Math.round(directKm * 10) / 10,
      durationMin: Math.round(((pathLengthKm(pathA) || directKm) / speedKmh) * 60 * 10) / 10,
      provider: "fallback-simulated",
    });
    rawRoutes.push({
      path: pathB,
      distanceKm: Math.round(pathLengthKm(pathB) * 10) / 10 || Math.round(directKm * 1.15 * 10) / 10,
      durationMin: Math.round(((pathLengthKm(pathB) || directKm * 1.15) / (speedKmh - 4)) * 60 * 10) / 10,
      provider: "fallback-simulated",
    });
    provider = "fallback-simulated";
  } else if (rawRoutes.length === 1) {
    // Only one OSRM route available — add a clearly labelled simulated detour variant.
    const detourPath = simulateFallbackPath(start, end, -1.0);
    rawRoutes.push({
      path: detourPath,
      distanceKm: Math.round((pathLengthKm(detourPath) || rawRoutes[0].distanceKm * 1.1) * 10) / 10,
      durationMin: Math.round(rawRoutes[0].durationMin * 1.12 * 10) / 10,
      provider: "fallback-simulated",
    });
  }

  const candidates: ScoredRouteInput[] = [];
  let idx = 0;
  for (const raw of rawRoutes) {
    const pm = await estimateRoutePm25(raw.path);
    idx += 1;
    candidates.push({
      id: `route-${idx}`,
      routeType: "balanced",
      name: `Phương án ${idx}`,
      path: raw.path,
      distanceKm: raw.distanceKm,
      durationMin: raw.durationMin,
      pm25Estimate: pm.pm25,
      pm25SampleCount: pm.sampleCount,
      confidence: raw.provider === "fallback-simulated" ? "low" : pm.confidence,
      provider: raw.provider,
    });
  }

  return { candidates, provider };
}

export function scoreAndLabelRoutes(candidates: ScoredRouteInput[], preference: number): RouteOption[] {
  const durations = candidates.map((c) => c.durationMin);
  const pmValues = candidates.map((c) => c.pm25Estimate ?? 0);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minPm = Math.min(...pmValues);
  const maxPm = Math.max(...pmValues);

  const w = Math.min(100, Math.max(0, preference)) / 100; // 0 = faster, 1 = cleaner

  const fastestIdx = durations.indexOf(minDuration);
  // Candidate with the lowest PM2.5 estimate (excluding ties handled naturally).
  let cleanestIdx = 0;
  for (let i = 1; i < candidates.length; i++) {
    if ((candidates[i].pm25Estimate ?? Infinity) < (candidates[cleanestIdx].pm25Estimate ?? Infinity)) {
      cleanestIdx = i;
    }
  }
  if (cleanestIdx === fastestIdx && candidates.length > 1) {
    cleanestIdx = fastestIdx === 0 ? 1 : 0;
  }

  const scored = candidates.map((c, i) => {
    const timeScore = normalize(c.durationMin, minDuration, maxDuration);
    const pmScore = normalize(c.pm25Estimate ?? maxPm, minPm, maxPm);
    const score = (1 - w) * timeScore + w * pmScore;

    let routeType: RouteOption["routeType"] = "balanced";
    let name = `Phương án ${i + 1}`;
    if (i === fastestIdx) {
      routeType = "fastest";
      name = "Tuyến nhanh nhất";
    } else if (i === cleanestIdx) {
      routeType = "cleaner";
      name = "Tuyến sạch hơn";
    }

    return { ...c, routeType, name, score, timeScore, pmScore };
  });

  const bestScore = Math.min(...scored.map((s) => s.score));

  return scored
    .map((s) => {
      const extraTimeMin = Math.max(0, Math.round((s.durationMin - minDuration) * 10) / 10);
      let explanation = "";
      if (s.routeType === "fastest") {
        explanation = "Thời gian di chuyển ngắn nhất trong các phương án hiện có.";
      } else if (s.routeType === "cleaner") {
        explanation =
          extraTimeMin > 0
            ? `Mức PM2.5 ước tính thấp hơn, đổi lại mất thêm khoảng ${extraTimeMin} phút so với tuyến nhanh nhất.`
            : "Mức PM2.5 ước tính thấp hơn mà không phát sinh thêm thời gian đáng kể.";
      } else {
        explanation = "Cân bằng giữa thời gian di chuyển và mức phơi nhiễm bụi mịn ước tính.";
      }

      return {
        id: s.id,
        routeType: s.routeType,
        name: s.name,
        path: s.path,
        distanceKm: s.distanceKm,
        durationMin: s.durationMin,
        extraTimeMin,
        pm25Estimate: s.pm25Estimate,
        pm25SampleCount: s.pm25SampleCount,
        confidence: s.confidence,
        score: Math.round(s.score * 1000) / 1000,
        isRecommended: Math.abs(s.score - bestScore) < 1e-6,
        explanation,
        provider: s.provider,
      } satisfies RouteOption;
    })
    .sort((a, b) => a.score - b.score);
}
