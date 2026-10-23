import { db } from "@/db";
import { savedRoutes, routeSearches } from "@/db/schema";
import type { RouteOption, RoutePoint, SavedRoute } from "@/lib/types";
import { desc, eq } from "drizzle-orm";
import { awardPoints } from "@/lib/services/green-points";

const DEMO_USER = "demo-user";

function toDto(row: typeof savedRoutes.$inferSelect): SavedRoute {
  return {
    id: row.id,
    name: row.name,
    startLabel: row.startLabel,
    startLat: row.startLat,
    startLng: row.startLng,
    endLabel: row.endLabel,
    endLat: row.endLat,
    endLng: row.endLng,
    distanceKm: row.distanceKm,
    durationMin: row.durationMin,
    pm25Estimate: row.pm25Estimate,
    extraTimeMin: row.extraTimeMin,
    routeType: row.routeType as SavedRoute["routeType"],
    confidence: row.confidence as SavedRoute["confidence"],
    path: row.pathJson as [number, number][],
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export async function listSavedRoutes(): Promise<SavedRoute[]> {
  const rows = await db
    .select()
    .from(savedRoutes)
    .where(eq(savedRoutes.userId, DEMO_USER))
    .orderBy(desc(savedRoutes.createdAt));
  return rows.map(toDto);
}

export async function saveRoute(start: RoutePoint, end: RoutePoint, route: RouteOption): Promise<SavedRoute> {
  const inserted = await db
    .insert(savedRoutes)
    .values({
      userId: DEMO_USER,
      name: `${start.label} → ${end.label} (${route.name})`,
      startLabel: start.label,
      startLat: start.lat,
      startLng: start.lng,
      endLabel: end.label,
      endLat: end.lat,
      endLng: end.lng,
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      pm25Estimate: route.pm25Estimate,
      extraTimeMin: route.extraTimeMin,
      routeType: route.routeType,
      confidence: route.confidence,
      pathJson: route.path,
    })
    .returning();

  await awardPoints("save_route", `Lưu tuyến: ${start.label} → ${end.label}`);
  return toDto(inserted[0]);
}

export async function deleteSavedRoute(id: number): Promise<void> {
  await db.delete(savedRoutes).where(eq(savedRoutes.id, id));
}

export async function logRouteSearch(
  start: RoutePoint,
  end: RoutePoint,
  preference: number,
  sensitiveMode: boolean,
  routes: RouteOption[],
): Promise<number> {
  const inserted = await db
    .insert(routeSearches)
    .values({
      userId: DEMO_USER,
      startLabel: start.label,
      startLat: start.lat,
      startLng: start.lng,
      endLabel: end.label,
      endLat: end.lat,
      endLng: end.lng,
      preference,
      sensitiveMode,
      resultsJson: routes,
    })
    .returning({ id: routeSearches.id });

  await awardPoints("route_search", `So sánh: ${start.label} → ${end.label}`);
  return inserted[0].id;
}

export interface RouteSearchHistoryItem {
  id: number;
  startLabel: string;
  endLabel: string;
  preference: number;
  sensitiveMode: boolean;
  routes: RouteOption[];
  createdAt: string;
}

export async function listRouteSearchHistory(limit = 20): Promise<RouteSearchHistoryItem[]> {
  const rows = await db
    .select()
    .from(routeSearches)
    .where(eq(routeSearches.userId, DEMO_USER))
    .orderBy(desc(routeSearches.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    startLabel: r.startLabel,
    endLabel: r.endLabel,
    preference: r.preference,
    sensitiveMode: r.sensitiveMode,
    routes: r.resultsJson as RouteOption[],
    createdAt: new Date(r.createdAt).toISOString(),
  }));
}
