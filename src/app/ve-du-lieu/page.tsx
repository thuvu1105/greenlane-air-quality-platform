"use client";

import { useState } from "react";
import { Card, SectionTitle, Spinner, Badge } from "@/components/ui/primitives";
import { TrendChart } from "@/components/charts/trend-chart";
import { useFetchJson } from "@/lib/hooks/use-fetch";
import type { MonitoringStation, TrendSeries } from "@/lib/types";

export default function AboutDataPage() {
  const stationsQuery = useFetchJson<{ stations: MonitoringStation[]; generatedAt: string }>("/api/stations", []);
  const trendQuery = useFetchJson<{ series: TrendSeries[] }>("/api/trend", []);
  const [district, setDistrict] = useState<string | null>(null);

  const series = trendQuery.data?.series ?? [];
  const activeSeries = series.find((s) => s.district === district) ?? series[0];

  return (
    <div className="gl-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <SectionTitle title="Về dữ liệu" subtitle="Minh bạch về nguồn gốc, độ chính xác và giới hạn của dữ liệu GreenLane đang sử dụng." />

        <Card className="border-2 border-[#F2994A]/40 bg-[#FFF8EE] p-4">
          <p className="text-sm font-bold text-[#8A5A00]">⚠️ Dữ liệu mô phỏng — chưa phải số đo cảm biến thực tế</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#6b4a12]">
            GreenLane hiện đang trong giai đoạn MVP. Toàn bộ điểm PM2.5 hiển thị trên bản đồ là dữ liệu mẫu được tạo ra để minh họa giao
            diện và luồng sử dụng sản phẩm. Mạng lưới cảm biến thực tế (ESP32 + PMS7003 + BME280 gắn trên xe) chưa được triển khai.
          </p>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Dữ liệu đến từ đâu?</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
            <li>
              <strong>Dữ liệu mô phỏng (simulated):</strong> giá trị PM2.5, nhiệt độ, độ ẩm được tạo thủ công tại ~22 vị trí tiêu biểu ở
              TP.HCM, có dao động ngẫu nhiên có kiểm soát để mô phỏng biến động thực tế.
            </li>
            <li>
              <strong>Dữ liệu ước tính (estimated):</strong> một số điểm không có "cảm biến" mô phỏng trực tiếp, giá trị được nội suy từ
              các điểm lân cận.
            </li>
            <li>
              <strong>Dữ liệu đo đạc (measured):</strong> dự kiến trong tương lai từ thiết bị ESP32 gắn PMS7003 (bụi mịn) và BME280
              (nhiệt độ/độ ẩm), dùng GPS &amp; kết nối Internet của điện thoại tài xế, nguồn điện lấy từ xe — <strong>chưa khả dụng ở bản demo này</strong>.
            </li>
            <li>
              <strong>Tuyến đường:</strong> hình học tuyến lấy từ dịch vụ định tuyến mở OSRM/OpenStreetMap khi khả dụng; nếu dịch vụ
              không phản hồi, hệ thống dùng phương án mô phỏng được đánh dấu rõ ràng "Demo mô phỏng".
            </li>
          </ul>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Cập nhật &amp; độ mới dữ liệu</h3>
          <p className="mt-1.5 text-xs text-slate-600">
            Mỗi điểm đo có dấu thời gian riêng. Bản đồ phân loại "Còn mới" nếu dữ liệu được ghi nhận trong vòng 60 phút gần nhất, ngược
            lại là "Đã cũ". Lần tải dữ liệu gần nhất:{" "}
            {stationsQuery.data ? new Date(stationsQuery.data.generatedAt).toLocaleString("vi-VN") : "đang tải…"}.
          </p>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Giới hạn về độ phủ &amp; độ chính xác</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
            <li>Mạng lưới điểm đo hiện rất thưa so với mật độ đường phố thực tế của TP.HCM — nhiều đoạn đường chưa có dữ liệu trực tiếp.</li>
            <li>PM2.5 có thể thay đổi nhanh theo gió, mật độ xe cộ, thời tiết — một điểm đo thấp không đảm bảo cả tuyến đường đều sạch.</li>
            <li>Giá trị ước tính theo tuyến chỉ phản ánh các điểm lấy mẫu dọc đường trong bán kính ~2.2km, không phải đo liên tục toàn tuyến.</li>
            <li>GreenLane cung cấp thông tin tham khảo về môi trường và so sánh tuyến đường, <strong>không phải</strong> chẩn đoán y tế hay cam kết giảm nguy cơ bệnh tật.</li>
          </ul>
        </Card>

        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18352B]">Xu hướng PM2.5 theo khu vực (24 giờ)</h3>
            <Badge tone="amber">Dữ liệu mẫu minh họa</Badge>
          </div>
          {trendQuery.loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6 text-[#27A765]" /></div>
          ) : series.length > 0 && activeSeries ? (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {series.map((s) => (
                  <button
                    key={s.district}
                    onClick={() => setDistrict(s.district)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      activeSeries.district === s.district ? "bg-[#27A765] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.district}
                  </button>
                ))}
              </div>
              <TrendChart points={activeSeries.points} />
              <p className="text-[11px] italic text-slate-400">
                Biểu đồ minh họa mẫu dao động theo giờ (cao điểm sáng/chiều), không phải chuỗi số liệu đo lường lịch sử thật.
              </p>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
