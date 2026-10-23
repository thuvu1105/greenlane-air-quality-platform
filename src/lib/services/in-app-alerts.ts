import { getAlertSettings } from "@/lib/services/alert-settings";
import { listSavedRoutes } from "@/lib/services/saved-routes";
import { listStations } from "@/lib/services/stations";
import { haversineKm } from "@/lib/geo";
import type { InAppAlert } from "@/lib/types";

/**
 * Computes in-app alerts by comparing the user's saved routes and the
 * current simulated station readings against the configured PM2.5
 * threshold. These are local, in-app notifications only — GreenLane does
 * not send real push notifications in this prototype.
 */
export async function computeInAppAlerts(): Promise<InAppAlert[]> {
  const [settings, savedRoutes, stations] = await Promise.all([
    getAlertSettings(),
    listSavedRoutes(),
    listStations(),
  ]);

  const alerts: InAppAlert[] = [];

  if (!settings.notificationsEnabled) {
    return alerts;
  }

  const threshold = settings.sensitiveMode ? Math.min(settings.pm25Threshold, 45) : settings.pm25Threshold;

  for (const route of savedRoutes) {
    const path = route.path;
    if (!path || path.length === 0) continue;
    // Sample a few points along the saved path and find worst nearby station reading.
    const sampleIdx = [0, Math.floor(path.length / 2), path.length - 1];
    let worst = 0;
    let worstStation: string | null = null;
    for (const idx of sampleIdx) {
      const point = path[idx];
      for (const station of stations) {
        const dist = haversineKm(point, [station.lat, station.lng]);
        if (dist <= 2.5 && station.pm25 > worst) {
          worst = station.pm25;
          worstStation = station.name;
        }
      }
    }

    if (worst > threshold) {
      alerts.push({
        id: `route-${route.id}`,
        severity: worst > threshold + 20 ? "danger" : "warning",
        title: `Tuyến đã lưu: ${route.startLabel} → ${route.endLabel}`,
        message: `Chất lượng không khí trên tuyến đường quen thuộc đang ở mức cao hơn ngưỡng bạn cài đặt (${Math.round(
          worst,
        )} µg/m³ gần "${worstStation ?? "điểm đo lân cận"}", ngưỡng ${threshold} µg/m³). Hãy kiểm tra tuyến thay thế trước khi khởi hành.`,
        routeName: route.name,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // General city hotspot alert if any station far exceeds threshold.
  const hotspot = stations.filter((s) => s.pm25 > threshold + 25).sort((a, b) => b.pm25 - a.pm25)[0];
  if (hotspot) {
    alerts.push({
      id: `hotspot-${hotspot.id}`,
      severity: "danger",
      title: `Điểm nóng ô nhiễm: ${hotspot.name}`,
      message: `PM2.5 ước tính tại khu vực ${hotspot.name} (${hotspot.district}) đang ở mức ${hotspot.pm25} µg/m³, cao hơn nhiều so với ngưỡng cảnh báo ${threshold} µg/m³. Cân nhắc tránh khu vực này, đặc biệt nếu bạn đang bật Chế độ nhạy cảm.`,
      createdAt: new Date().toISOString(),
    });
  }

  if (settings.sensitiveMode) {
    alerts.push({
      id: "sensitive-mode-info",
      severity: "info",
      title: "Chế độ nhạy cảm đang bật",
      message:
        "GreenLane sẽ ưu tiên đề xuất ngưỡng cảnh báo thấp hơn và nhấn mạnh các tuyến sạch hơn, phù hợp cho trẻ em, người lớn tuổi hoặc người nhạy cảm với bụi mịn.",
      createdAt: new Date().toISOString(),
    });
  }

  return alerts;
}
