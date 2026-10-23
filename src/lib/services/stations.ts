import { db } from "@/db";
import { monitoringStations } from "@/db/schema";
import { STATION_SEEDS } from "@/lib/stations-seed";
import type { DataFreshness, MonitoringStation } from "@/lib/types";
import { sql } from "drizzle-orm";

let seedPromise: Promise<void> | null = null;

/** Lazily seeds the monitoring_stations table once with demo data. */
export async function ensureStationsSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(monitoringStations);
      if (count > 0) return;

      const now = Date.now();
      const rows = STATION_SEEDS.map((seed, index) => {
        // Spread recorded timestamps over the last ~90 minutes so the
        // freshness filter has a realistic mix of "recent" vs "stale".
        const minutesAgo = (index * 7) % 95;
        const jitter = Math.sin(index * 13.37) * 6; // deterministic +-6 µg/m³ jitter
        return {
          name: seed.name,
          district: seed.district,
          lat: seed.lat,
          lng: seed.lng,
          pm25: Math.max(5, Math.round((seed.basePm25 + jitter) * 10) / 10),
          temperature: Math.round((29 + Math.sin(index * 2.1) * 3) * 10) / 10,
          humidity: Math.round(60 + Math.cos(index * 1.7) * 12),
          sourceType: seed.sourceType,
          sensorId: seed.sensorId,
          note: seed.note,
          recordedAt: new Date(now - minutesAgo * 60_000),
        };
      });

      await db.insert(monitoringStations).values(rows);
    })();
  }
  return seedPromise;
}

function toFreshness(minutesAgo: number): DataFreshness {
  return minutesAgo <= 60 ? "recent" : "stale";
}

export interface StationFilters {
  minPm25?: number;
  maxPm25?: number;
  freshness?: DataFreshness | "all";
  sourceType?: "simulated" | "estimated" | "measured" | "all";
}

export async function listStations(filters: StationFilters = {}): Promise<MonitoringStation[]> {
  await ensureStationsSeeded();
  const rows = await db.select().from(monitoringStations);
  const now = Date.now();

  let result: MonitoringStation[] = rows.map((row) => {
    const minutesAgo = Math.max(0, Math.round((now - new Date(row.recordedAt).getTime()) / 60_000));
    return {
      id: row.id,
      name: row.name,
      district: row.district,
      lat: row.lat,
      lng: row.lng,
      pm25: row.pm25,
      temperature: row.temperature,
      humidity: row.humidity,
      sourceType: row.sourceType as MonitoringStation["sourceType"],
      sensorId: row.sensorId,
      note: row.note,
      recordedAt: new Date(row.recordedAt).toISOString(),
      freshness: toFreshness(minutesAgo),
      minutesAgo,
    };
  });

  if (typeof filters.minPm25 === "number") {
    result = result.filter((s) => s.pm25 >= filters.minPm25!);
  }
  if (typeof filters.maxPm25 === "number") {
    result = result.filter((s) => s.pm25 <= filters.maxPm25!);
  }
  if (filters.freshness && filters.freshness !== "all") {
    result = result.filter((s) => s.freshness === filters.freshness);
  }
  if (filters.sourceType && filters.sourceType !== "all") {
    result = result.filter((s) => s.sourceType === filters.sourceType);
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export { pm25Level } from "@/lib/pm25-scale";
