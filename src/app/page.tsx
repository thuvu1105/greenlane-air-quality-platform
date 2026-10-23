"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/primitives";
import { Legend } from "@/components/map/legend";
import { StationFilters, type StationFilterState } from "@/components/map/station-filters";
import { RoutePlannerPanel } from "@/components/route/route-planner-panel";
import { useFetchJson } from "@/lib/hooks/use-fetch";
import { useRouteSearch } from "@/lib/context/route-search-context";
import type { MonitoringStation } from "@/lib/types";

const MapView = dynamic(() => import("@/components/map/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#eef3f0] text-sm text-slate-500">
      Đang tải bản đồ…
    </div>
  ),
});

export default function MapPage() {
  const [filters, setFilters] = useState<StationFilterState>({ minPm25: 0, freshness: "all", sourceType: "all" });
  const [showFilters, setShowFilters] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.minPm25 > 0) params.set("minPm25", String(filters.minPm25));
    if (filters.freshness !== "all") params.set("freshness", filters.freshness);
    if (filters.sourceType !== "all") params.set("sourceType", filters.sourceType);
    return `/api/stations?${params.toString()}`;
  }, [filters]);

  const { data, loading, error } = useFetchJson<{ stations: MonitoringStation[]; generatedAt: string }>(query, [query]);
  const stations = data?.stations ?? [];

  const { start, end, result, selectedRouteId, setSelectedRouteId } = useRouteSearch();
  const routes = result?.routes ?? [];

  return (
    <div className="relative h-full w-full">
      <MapView
        stations={stations}
        routes={routes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
        start={start}
        end={end}
        onStationClick={setSelectedStation}
      />

      {/* Top status bar */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-[900] w-[94%] max-w-md -translate-x-1/2 md:left-3 md:w-auto md:translate-x-0">
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl bg-white/95 px-3.5 py-2 text-xs shadow-md backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="gl-live-dot h-2 w-2 rounded-full bg-[#F2994A]" />
            <span className="font-semibold text-[#18352B]">Dữ liệu mô phỏng</span>
            <span className="hidden text-slate-400 sm:inline">— chưa phải số đo cảm biến thực tế</span>
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="rounded-lg bg-[#EAF6FF] px-2.5 py-1 font-semibold text-[#1668A3]"
          >
            Bộ lọc
          </button>
        </div>
        {showFilters ? (
          <Card className="pointer-events-auto mt-2 max-h-[50vh] overflow-y-auto p-4 gl-scrollbar">
            <StationFilters value={filters} onChange={setFilters} />
          </Card>
        ) : null}
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-[86px] left-3 z-[900] md:bottom-3">
        <Card className="pointer-events-auto max-w-[220px] p-3">
          <Legend compact />
          {loading ? <p className="mt-1 text-[10px] text-slate-400">Đang tải điểm đo…</p> : null}
          {error ? <p className="mt-1 text-[10px] text-red-500">{error}</p> : null}
          <p className="mt-1 text-[10px] text-slate-400">{stations.length} điểm đo đang hiển thị</p>
        </Card>
      </div>

      {/* Selected station detail (mobile + desktop) */}
      {selectedStation ? (
        <div className="absolute right-3 top-16 z-[950] w-[260px] md:top-3">
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold text-[#18352B]">{selectedStation.name}</p>
              <button onClick={() => setSelectedStation(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">{selectedStation.district}</p>
            <p className="mt-2 text-lg font-extrabold text-[#18352B]">{selectedStation.pm25} <span className="text-xs font-medium text-slate-400">µg/m³ PM2.5</span></p>
            <p className="text-xs text-slate-500">
              🌡 {selectedStation.temperature}°C · 💧 {selectedStation.humidity}%
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Cập nhật {selectedStation.minutesAgo} phút trước ({selectedStation.freshness === "recent" ? "còn mới" : "đã cũ"})</p>
            <p className="mt-1 text-[11px] font-semibold text-[#C8820A]">
              {selectedStation.sourceType === "estimated" ? "Ước tính nội suy" : "Dữ liệu mô phỏng"}
            </p>
            {selectedStation.note ? <p className="mt-1 text-[11px] italic text-slate-500">{selectedStation.note}</p> : null}
          </Card>
        </div>
      ) : null}

      {/* Desktop route planner panel */}
      <div className="absolute left-3 top-16 z-[800] hidden h-[calc(100%-5rem)] w-[380px] md:block">
        <Card className="h-full overflow-hidden p-4">
          <RoutePlannerPanel />
        </Card>
      </div>

      {/* Mobile bottom sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 z-[1000] rounded-t-3xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-[height] duration-200 md:hidden ${
          sheetOpen ? "h-[78%]" : "h-[132px]"
        }`}
      >
        <button
          className="flex w-full flex-col items-center pt-2.5 pb-2"
          onClick={() => setSheetOpen((v) => !v)}
          aria-label="Mở/thu gọn bảng tìm tuyến đường"
        >
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
          <span className="mt-2 text-xs font-semibold text-[#18352B]">
            {sheetOpen ? "Thu gọn" : "Tìm tuyến đường sạch hơn"}
          </span>
        </button>
        <div className="h-[calc(100%-50px)] overflow-hidden px-4 pb-4">
          <RoutePlannerPanel onSaved={() => setSheetOpen(true)} />
        </div>
      </div>
    </div>
  );
}
