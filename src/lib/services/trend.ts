import { listStations } from "@/lib/services/stations";
import type { TrendSeries } from "@/lib/types";

/**
 * Generates an illustrative 24h PM2.5 trend per district from the current
 * simulated station snapshot. This is NOT a measured historical record —
 * it is a deterministic sample pattern (morning + evening traffic peaks)
 * used only to demonstrate the charting UI.
 */
export async function getTrendByDistrict(): Promise<TrendSeries[]> {
  const stations = await listStations();
  const byDistrict = new Map<string, number[]>();
  for (const s of stations) {
    const arr = byDistrict.get(s.district) ?? [];
    arr.push(s.pm25);
    byDistrict.set(s.district, arr);
  }

  const series: TrendSeries[] = [];
  for (const [district, values] of byDistrict.entries()) {
    const base = values.reduce((a, b) => a + b, 0) / values.length;
    const points = Array.from({ length: 24 }, (_, hour) => {
      // Morning peak ~7-8h, evening peak ~17-19h, trough at night.
      const morningPeak = Math.exp(-((hour - 7.5) ** 2) / 6) * 16;
      const eveningPeak = Math.exp(-((hour - 18) ** 2) / 8) * 20;
      const nightTrough = Math.exp(-((hour - 3) ** 2) / 10) * -10;
      const value = Math.max(5, base + morningPeak + eveningPeak + nightTrough);
      return { hour: `${hour.toString().padStart(2, "0")}:00`, pm25: Math.round(value * 10) / 10 };
    });
    series.push({ district, points, isSample: true });
  }

  return series.sort((a, b) => a.district.localeCompare(b.district));
}
