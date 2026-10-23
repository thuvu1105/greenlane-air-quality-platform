"use client";

import { useState } from "react";
import { LocationInput } from "@/components/route/location-input";
import { RouteCard } from "@/components/route/route-card";
import { Button, Toggle, Spinner } from "@/components/ui/primitives";
import { useRouteSearch } from "@/lib/context/route-search-context";

export function RoutePlannerPanel({ onSaved }: { onSaved?: () => void }) {
  const {
    start,
    end,
    setStart,
    setEnd,
    preference,
    setPreference,
    sensitiveMode,
    setSensitiveMode,
    result,
    loading,
    error,
    runSearch,
    selectedRouteId,
    setSelectedRouteId,
    bumpSavedRoutesVersion,
  } = useRouteSearch();

  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function useCurrentLocation() {
    setLocateError(null);
    if (!("geolocation" in navigator)) {
      setLocateError("Trình duyệt không hỗ trợ định vị. Vui lòng nhập địa điểm thủ công.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          setStart({ label: data.label ?? "Vị trí hiện tại", lat: latitude, lng: longitude });
        } catch {
          setStart({ label: "Vị trí hiện tại", lat: latitude, lng: longitude });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocateError("Không thể lấy vị trí — bạn đã từ chối quyền truy cập hoặc thiết bị không hỗ trợ. Vui lòng nhập địa điểm thủ công.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function handleSave(routeId: string) {
    if (!start || !end || !result) return;
    const route = result.routes.find((r) => r.id === routeId);
    if (!route) return;
    setSavingId(routeId);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/routes/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end, route }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không thể lưu tuyến.");
      setSaveMessage("Đã lưu tuyến đường vào mục Tuyến đường. +10 Điểm xanh!");
      bumpSavedRoutesVersion();
      onSaved?.();
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Không thể lưu tuyến.");
    } finally {
      setSavingId(null);
    }
  }

  function swap() {
    const s = start;
    setStart(end);
    setEnd(s);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2.5">
        <LocationInput placeholder="Điểm đi" value={start} onSelect={setStart} accent="#27A765" />
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-medium text-[#1668A3] hover:underline disabled:text-slate-400"
        >
          📍 {locating ? "Đang xác định vị trí…" : "Dùng vị trí hiện tại của tôi"}
        </button>
        {locateError ? <p className="text-xs text-[#C83A2C]">{locateError}</p> : null}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swap}
            className="rounded-full border border-slate-200 bg-white p-1.5 text-xs text-slate-500 hover:bg-slate-50"
            aria-label="Đổi chiều điểm đi/điểm đến"
          >
            ↕
          </button>
        </div>
        <LocationInput placeholder="Điểm đến" value={end} onSelect={setEnd} accent="#E8483A" />
      </div>

      <div className="mt-4 rounded-2xl bg-[#F6F9F7] p-3.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#18352B]">
          <span>⚡ Nhanh hơn</span>
          <span>Sạch hơn 🌿</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={preference}
          onChange={(e) => setPreference(Number(e.target.value))}
          className="mt-2 w-full accent-[#27A765]"
          aria-label="Nhanh hơn ↔ Sạch hơn"
        />
        <p className="mt-1 text-center text-[11px] text-slate-500">
          Mức ưu tiên hiện tại: <strong>{preference}</strong>/100 — {preference < 35 ? "ưu tiên thời gian" : preference > 65 ? "ưu tiên không khí sạch" : "cân bằng"}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-100 px-3.5 py-2">
        <Toggle
          checked={sensitiveMode}
          onChange={setSensitiveMode}
          label="Chế độ nhạy cảm"
          description="Dành cho trẻ em, người lớn tuổi hoặc người nhạy cảm với bụi mịn — hạ ngưỡng và ưu tiên tuyến sạch hơn."
        />
      </div>

      <Button className="mt-3 w-full" onClick={runSearch} disabled={loading || !start || !end}>
        {loading ? <Spinner /> : null}
        Tìm tuyến đường
      </Button>

      {error ? <p className="mt-2 text-xs font-medium text-[#C83A2C]">{error}</p> : null}
      {saveMessage ? <p className="mt-2 text-xs font-medium text-[#116B45]">{saveMessage}</p> : null}

      <div className="gl-scrollbar mt-4 flex-1 space-y-2.5 overflow-y-auto pb-2">
        {result ? (
          <>
            <p className="text-[11px] text-slate-500">{result.disclaimer}</p>
            {result.routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                selected={route.id === selectedRouteId}
                onSelect={() => setSelectedRouteId(route.id)}
                onSave={() => handleSave(route.id)}
                saving={savingId === route.id}
              />
            ))}
          </>
        ) : !loading ? (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            Chọn điểm đi, điểm đến rồi bấm “Tìm tuyến đường” để so sánh thời gian di chuyển và mức PM2.5 ước tính.
          </p>
        ) : null}
      </div>
    </div>
  );
}
