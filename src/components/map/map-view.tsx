"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { HCMC_CENTER } from "@/lib/geo";
import { pm25Level } from "@/lib/pm25-scale";
import type { MonitoringStation, RouteOption, RoutePoint } from "@/lib/types";

function FlyToBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useMemo(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.flyTo(points[0], 15, { duration: 0.6 });
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.flyToBounds(bounds, { padding: [48, 48], duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

function pinIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;">
      <span style="transform:rotate(45deg);color:white;font-size:13px;font-weight:700;">${label}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

const ROUTE_COLORS: Record<string, string> = {
  fastest: "#249CF4",
  cleaner: "#27A765",
  balanced: "#8A6DD1",
};

export function MapView({
  stations,
  routes,
  selectedRouteId,
  onSelectRoute,
  start,
  end,
  onStationClick,
}: {
  stations: MonitoringStation[];
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute?: (id: string) => void;
  start: RoutePoint | null;
  end: RoutePoint | null;
  onStationClick?: (station: MonitoringStation) => void;
}) {
  const focusPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];
    if (start) pts.push([start.lat, start.lng]);
    if (end) pts.push([end.lat, end.lng]);
    if (routes.length > 0) {
      const r = routes.find((x) => x.id === selectedRouteId) ?? routes[0];
      r.path.forEach((p) => pts.push(p));
    }
    return pts;
  }, [start, end, routes, selectedRouteId]);

  return (
    <MapContainer center={HCMC_CENTER} zoom={13} className="h-full w-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stations.map((station) => {
        const level = pm25Level(station.pm25);
        return (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={9}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: level.color,
              fillOpacity: station.freshness === "stale" ? 0.45 : 0.9,
            }}
            eventHandlers={{ click: () => onStationClick?.(station) }}
          >
            <Popup>
              <div className="min-w-[200px] text-sm">
                <p className="font-bold text-[#18352B]">{station.name}</p>
                <p className="text-xs text-slate-500">{station.district}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: level.color }} />
                  <span className="font-semibold">{station.pm25} µg/m³</span>
                  <span className="text-xs text-slate-500">({level.label})</span>
                </div>
                {station.temperature != null ? (
                  <p className="mt-1 text-xs text-slate-600">
                    🌡 {station.temperature}°C · 💧 {station.humidity}%
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  Cập nhật {station.minutesAgo} phút trước · {station.freshness === "recent" ? "Còn mới" : "Đã cũ"}
                </p>
                <p className="mt-1 text-xs font-medium text-[#C8820A]">
                  Trạng thái: {station.sourceType === "measured" ? "Đã đo (cảm biến thực)" : station.sourceType === "estimated" ? "Ước tính nội suy" : "Dữ liệu mô phỏng"}
                </p>
                {station.note ? <p className="mt-1 text-xs italic text-slate-500">{station.note}</p> : null}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.path}
          pathOptions={{
            color: ROUTE_COLORS[route.routeType] ?? "#8A6DD1",
            weight: route.id === selectedRouteId ? 7 : 4,
            opacity: route.id === selectedRouteId ? 0.95 : 0.45,
          }}
          eventHandlers={{ click: () => onSelectRoute?.(route.id) }}
        />
      ))}

      {start ? <Marker position={[start.lat, start.lng]} icon={pinIcon("#27A765", "A")} /> : null}
      {end ? <Marker position={[end.lat, end.lng]} icon={pinIcon("#E8483A", "B")} /> : null}

      <FlyToBounds points={focusPoints} />
    </MapContainer>
  );
}
