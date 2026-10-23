"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, EmptyState, SectionTitle, Spinner, Badge } from "@/components/ui/primitives";
import { RouteCard } from "@/components/route/route-card";
import { useFetchJson } from "@/lib/hooks/use-fetch";
import { useRouteSearch } from "@/lib/context/route-search-context";
import type { SavedRoute } from "@/lib/types";
import type { RouteSearchHistoryItem } from "@/lib/services/saved-routes";

type Tab = "current" | "saved" | "history";

export default function RoutesPage() {
  const [tab, setTab] = useState<Tab>("current");
  const { result, selectedRouteId, setSelectedRouteId, start, end } = useRouteSearch();

  const savedQuery = useFetchJson<{ routes: SavedRoute[] }>("/api/routes/saved", [tab]);
  const historyQuery = useFetchJson<{ history: RouteSearchHistoryItem[] }>("/api/routes/history", [tab]);

  async function removeSavedRoute(id: number) {
    await fetch(`/api/routes/saved/${id}`, { method: "DELETE" });
    savedQuery.refetch();
  }

  return (
    <div className="gl-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <SectionTitle
          title="Tuyến đường"
          subtitle="So sánh kết quả tìm tuyến gần nhất, quản lý tuyến đã lưu và xem lại lịch sử so sánh."
        />

        <div className="mb-4 flex gap-2 rounded-xl bg-white p-1 shadow-sm">
          {[
            { k: "current", label: "Kết quả hiện tại" },
            { k: "saved", label: `Đã lưu (${savedQuery.data?.routes.length ?? 0})` },
            { k: "history", label: "Lịch sử tìm kiếm" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as Tab)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                tab === t.k ? "bg-[#27A765] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "current" ? (
          result ? (
            <div className="space-y-3">
              <Card className="p-4 text-sm">
                <p className="font-semibold text-[#18352B]">
                  {start?.label ?? "Điểm đi"} → {end?.label ?? "Điểm đến"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{result.disclaimer}</p>
              </Card>
              {result.routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  selected={route.id === selectedRouteId}
                  onSelect={() => setSelectedRouteId(route.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🧭"
              title="Chưa có kết quả so sánh nào"
              description="Hãy sang màn hình Bản đồ, nhập điểm đi/điểm đến rồi bấm “Tìm tuyến đường”."
            />
          )
        ) : null}

        {tab === "saved" ? (
          savedQuery.loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6 text-[#27A765]" /></div>
          ) : savedQuery.data && savedQuery.data.routes.length > 0 ? (
            <div className="space-y-3">
              {savedQuery.data.routes.map((route) => (
                <Card key={route.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#18352B]">{route.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Lưu lúc {new Date(route.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <Badge tone={route.routeType === "cleaner" ? "green" : route.routeType === "fastest" ? "blue" : "purple"}>
                      {route.routeType === "cleaner" ? "Sạch hơn" : route.routeType === "fastest" ? "Nhanh nhất" : "Cân bằng"}
                    </Badge>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 py-2">
                      <p className="text-[10px] text-slate-400">Quãng đường</p>
                      <p className="text-sm font-bold">{route.distanceKm} km</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 py-2">
                      <p className="text-[10px] text-slate-400">Thời gian</p>
                      <p className="text-sm font-bold">{Math.round(route.durationMin)} phút</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 py-2">
                      <p className="text-[10px] text-slate-400">PM2.5</p>
                      <p className="text-sm font-bold">{route.pm25Estimate != null ? `${route.pm25Estimate}` : "—"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => removeSavedRoute(route.id)}>
                      Xóa tuyến
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon="💾" title="Chưa lưu tuyến đường nào" description="Lưu tuyến từ kết quả tìm kiếm ở màn hình Bản đồ để xem lại tại đây." />
          )
        ) : null}

        {tab === "history" ? (
          historyQuery.loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6 text-[#27A765]" /></div>
          ) : historyQuery.data && historyQuery.data.history.length > 0 ? (
            <div className="space-y-3">
              {historyQuery.data.history.map((h) => (
                <Card key={h.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#18352B]">
                      {h.startLabel} → {h.endLabel}
                    </p>
                    <span className="text-[11px] text-slate-400">{new Date(h.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Ưu tiên: {h.preference}/100 {h.sensitiveMode ? "· Chế độ nhạy cảm bật" : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {h.routes.map((r) => (
                      <span key={r.id} className="rounded-full bg-slate-50 px-2.5 py-1">
                        {r.name}: {Math.round(r.durationMin)} phút · {r.pm25Estimate ?? "—"} µg/m³
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon="🕓" title="Chưa có lịch sử tìm kiếm" description="Lịch sử các lần so sánh tuyến đường sẽ xuất hiện tại đây." />
          )
        ) : null}

        <p className="mt-6 text-center text-xs text-slate-400">
          Chưa thấy kết quả bạn cần? Quay lại{" "}
          <Link href="/" className="font-semibold text-[#116B45] underline">
            Bản đồ
          </Link>{" "}
          để tìm tuyến mới.
        </p>
      </div>
    </div>
  );
}
