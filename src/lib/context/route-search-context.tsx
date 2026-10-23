"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { RouteOption, RoutePoint, RouteSearchResponse } from "@/lib/types";

interface RouteSearchState {
  start: RoutePoint | null;
  end: RoutePoint | null;
  preference: number; // 0 faster .. 100 cleaner
  sensitiveMode: boolean;
  result: RouteSearchResponse | null;
  selectedRouteId: string | null;
  loading: boolean;
  error: string | null;
  setStart: (p: RoutePoint | null) => void;
  setEnd: (p: RoutePoint | null) => void;
  setPreference: (v: number) => void;
  setSensitiveMode: (v: boolean) => void;
  setSelectedRouteId: (id: string | null) => void;
  runSearch: () => Promise<void>;
  selectedRoute: RouteOption | null;
  savedRoutesVersion: number;
  bumpSavedRoutesVersion: () => void;
}

const RouteSearchContext = createContext<RouteSearchState | null>(null);

export function RouteSearchProvider({ children }: { children: ReactNode }) {
  const [start, setStart] = useState<RoutePoint | null>(null);
  const [end, setEnd] = useState<RoutePoint | null>(null);
  const [preference, setPreference] = useState(50);
  const [sensitiveMode, setSensitiveMode] = useState(false);
  const [result, setResult] = useState<RouteSearchResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRoutesVersion, setSavedRoutesVersion] = useState(0);

  const runSearch = useCallback(async () => {
    if (!start || !end) {
      setError("Vui lòng chọn điểm đi và điểm đến.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/routes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end, preference, sensitiveMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không thể tìm tuyến đường.");
      setResult(data as RouteSearchResponse);
      const recommended = (data.routes as RouteOption[]).find((r) => r.isRecommended) ?? data.routes[0];
      setSelectedRouteId(recommended?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }, [start, end, preference, sensitiveMode]);

  const selectedRoute = useMemo(
    () => result?.routes.find((r) => r.id === selectedRouteId) ?? null,
    [result, selectedRouteId],
  );

  const bumpSavedRoutesVersion = useCallback(() => setSavedRoutesVersion((v) => v + 1), []);

  const value: RouteSearchState = {
    start,
    end,
    preference,
    sensitiveMode,
    result,
    selectedRouteId,
    loading,
    error,
    setStart,
    setEnd,
    setPreference,
    setSensitiveMode,
    setSelectedRouteId,
    runSearch,
    selectedRoute,
    savedRoutesVersion,
    bumpSavedRoutesVersion,
  };

  return <RouteSearchContext.Provider value={value}>{children}</RouteSearchContext.Provider>;
}

export function useRouteSearch() {
  const ctx = useContext(RouteSearchContext);
  if (!ctx) throw new Error("useRouteSearch must be used inside RouteSearchProvider");
  return ctx;
}
