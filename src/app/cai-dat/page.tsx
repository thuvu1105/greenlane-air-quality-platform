"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, SectionTitle, Toggle } from "@/components/ui/primitives";

interface ProfilePrefs {
  displayName: string;
  vehicleType: "Xe máy xăng" | "Xe máy điện" | "Xe đạp điện";
  homeArea: string;
  distanceUnit: "km";
  shareApproxLocation: boolean;
}

const DEFAULT_PREFS: ProfilePrefs = {
  displayName: "Người dùng GreenLane",
  vehicleType: "Xe máy xăng",
  homeArea: "",
  distanceUnit: "km",
  shareApproxLocation: false,
};

const STORAGE_KEY = "greenlane:profile-prefs";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<ProfilePrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt local storage
    }
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function clearLocalData() {
    localStorage.removeItem(STORAGE_KEY);
    setPrefs(DEFAULT_PREFS);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  }

  return (
    <div className="gl-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <SectionTitle title="Cài đặt" subtitle="Tùy chọn hồ sơ và quyền riêng tư. Cài đặt cảnh báo chi tiết nằm ở mục Cảnh báo." />

        <Card className="p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Hồ sơ cá nhân (lưu cục bộ trên trình duyệt)</h3>
          <p className="mt-1 text-xs text-slate-500">
            Bản demo chưa có hệ thống tài khoản/đăng nhập. Thông tin dưới đây chỉ lưu trong trình duyệt của bạn (localStorage), không gửi
            lên máy chủ.
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500">Tên hiển thị</label>
              <input
                value={prefs.displayName}
                onChange={(e) => setPrefs({ ...prefs, displayName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500">Phương tiện</label>
              <select
                value={prefs.vehicleType}
                onChange={(e) => setPrefs({ ...prefs, vehicleType: e.target.value as ProfilePrefs["vehicleType"] })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              >
                <option>Xe máy xăng</option>
                <option>Xe máy điện</option>
                <option>Xe đạp điện</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500">Khu vực thường di chuyển</label>
              <input
                value={prefs.homeArea}
                onChange={(e) => setPrefs({ ...prefs, homeArea: e.target.value })}
                placeholder="VD: Quận Bình Thạnh"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </div>
            <Toggle
              checked={prefs.shareApproxLocation}
              onChange={(v) => setPrefs({ ...prefs, shareApproxLocation: v })}
              label="Cho phép dùng vị trí hiện tại khi tìm tuyến"
              description="Chỉ được sử dụng khi bạn chủ động bấm nút 'Dùng vị trí hiện tại' ở màn hình Bản đồ — GreenLane không theo dõi vị trí nền."
            />
            <div className="flex items-center gap-3">
              <Button onClick={save}>Lưu thay đổi</Button>
              {saved ? <span className="text-xs font-medium text-[#116B45]">Đã lưu.</span> : null}
            </div>
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Thông báo</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            GreenLane hiện chỉ hỗ trợ <strong>thông báo trong ứng dụng</strong> (in-app) tại mục{" "}
            <Link href="/canh-bao" className="font-semibold text-[#116B45] underline">
              Cảnh báo
            </Link>
            . Ứng dụng <strong>chưa</strong> tích hợp push notification qua trình duyệt/điện thoại ở bản demo này.
          </p>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Quyền riêng tư &amp; dữ liệu</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
            <li>GreenLane không yêu cầu quyền vị trí nền; vị trí chỉ được truy vấn khi bạn chủ động bấm nút trên màn hình Bản đồ.</li>
            <li>Bạn luôn có thể nhập điểm đi/điểm đến thủ công thay vì dùng định vị.</li>
            <li>Lịch sử tuyến đường và báo cáo môi trường được lưu để phục vụ demo, không dùng cho mục đích thương mại.</li>
            <li>GreenLane cung cấp thông tin môi trường tham khảo, không phải tư vấn y tế.</li>
          </ul>
          <div className="mt-3">
            <Button variant="danger" onClick={clearLocalData}>
              Xóa dữ liệu hồ sơ cục bộ
            </Button>
            {cleared ? <span className="ml-2 text-xs font-medium text-[#C83A2C]">Đã xóa.</span> : null}
          </div>
        </Card>

        <Card className="mt-4 p-4 text-xs text-slate-400">
          <p>GreenLane MVP · Phiên bản demo nội bộ</p>
          <p className="mt-1">Dữ liệu bản đồ: © OpenStreetMap contributors · Định tuyến: OSRM demo server</p>
        </Card>
      </div>
    </div>
  );
}
