// ---------------------------------------------------------------------------
// Seed data for the "monitoring_stations" table.
//
// IMPORTANT: GreenLane does not yet operate a real ESP32 / PMS7003 / BME280
// sensor network. These values are hand-crafted sample points spread across
// well-known Ho Chi Minh City locations so the UI can be demonstrated end to
// end. They are clearly marked with sourceType "simulated" or "estimated".
// ---------------------------------------------------------------------------

export interface StationSeed {
  name: string;
  district: string;
  lat: number;
  lng: number;
  basePm25: number;
  sourceType: "simulated" | "estimated";
  sensorId: string | null;
  note: string;
}

export const STATION_SEEDS: StationSeed[] = [
  { name: "Chợ Bến Thành", district: "Quận 1", lat: 10.7725, lng: 106.698, basePm25: 62, sourceType: "simulated", sensorId: "GL-SIM-001", note: "Khu vực giao thông đông đúc, nhiều xe máy." },
  { name: "Nhà thờ Đức Bà", district: "Quận 1", lat: 10.7798, lng: 106.6990, basePm25: 48, sourceType: "simulated", sensorId: "GL-SIM-002", note: "Gần công viên, mật độ cây xanh cao hơn." },
  { name: "Công viên Tao Đàn", district: "Quận 1", lat: 10.7764, lng: 106.6908, basePm25: 34, sourceType: "simulated", sensorId: "GL-SIM-003", note: "Nhiều cây xanh, ít phương tiện lưu thông." },
  { name: "Vòng xoay Lăng Cha Cả", district: "Tân Bình", lat: 10.7975, lng: 106.6523, basePm25: 78, sourceType: "simulated", sensorId: "GL-SIM-004", note: "Gần sân bay, lưu lượng xe cao điểm lớn." },
  { name: "Ngã tư Hàng Xanh", district: "Bình Thạnh", lat: 10.8010, lng: 106.7108, basePm25: 85, sourceType: "simulated", sensorId: "GL-SIM-005", note: "Nút giao trọng điểm, thường xuyên ùn tắc." },
  { name: "Cầu Sài Gòn", district: "Bình Thạnh", lat: 10.7943, lng: 106.7213, basePm25: 58, sourceType: "simulated", sensorId: "GL-SIM-006", note: "Gió sông giúp phát tán bụi mịn." },
  { name: "Thảo Cầm Viên", district: "Quận 1", lat: 10.7878, lng: 106.7054, basePm25: 30, sourceType: "simulated", sensorId: "GL-SIM-007", note: "Khu cây xanh lớn ven sông." },
  { name: "Chợ Lớn (Quận 5)", district: "Quận 5", lat: 10.7540, lng: 106.6634, basePm25: 70, sourceType: "simulated", sensorId: "GL-SIM-008", note: "Khu vực chợ truyền thống, xe tải ra vào nhiều." },
  { name: "Đại học Bách Khoa", district: "Quận 10", lat: 10.7724, lng: 106.6578, basePm25: 52, sourceType: "simulated", sensorId: "GL-SIM-009", note: "Khu dân cư, giao thông trung bình." },
  { name: "Sân bay Tân Sơn Nhất", district: "Tân Bình", lat: 10.8188, lng: 106.6520, basePm25: 74, sourceType: "simulated", sensorId: "GL-SIM-010", note: "Gần khu vực hoạt động hàng không." },
  { name: "Landmark 81", district: "Bình Thạnh", lat: 10.7949, lng: 106.7218, basePm25: 44, sourceType: "simulated", sensorId: "GL-SIM-011", note: "Khu đô thị mới ven sông Sài Gòn." },
  { name: "Phú Mỹ Hưng", district: "Quận 7", lat: 10.7296, lng: 106.7193, basePm25: 28, sourceType: "simulated", sensorId: "GL-SIM-012", note: "Khu đô thị quy hoạch, mật độ xe thấp hơn." },
  { name: "Ngã tư Thủ Đức", district: "Thủ Đức", lat: 10.8494, lng: 106.7716, basePm25: 66, sourceType: "simulated", sensorId: "GL-SIM-013", note: "Cửa ngõ xa lộ Hà Nội, nhiều xe container." },
  { name: "Suối Tiên", district: "Thủ Đức", lat: 10.8697, lng: 106.8032, basePm25: 40, sourceType: "simulated", sensorId: "GL-SIM-014", note: "Vùng ven, mật độ giao thông thấp hơn nội đô." },
  { name: "Công viên Lê Văn Tám", district: "Quận 1", lat: 10.7881, lng: 106.6912, basePm25: 36, sourceType: "simulated", sensorId: "GL-SIM-015", note: "Khu công viên, ít nguồn phát thải trực tiếp." },
  { name: "Bến xe Miền Đông", district: "Bình Thạnh", lat: 10.8126, lng: 106.7128, basePm25: 82, sourceType: "simulated", sensorId: "GL-SIM-016", note: "Bến xe khách, nhiều xe lớn nổ máy liên tục." },
  { name: "Chợ Bà Chiểu", district: "Bình Thạnh", lat: 10.8033, lng: 106.6957, basePm25: 60, sourceType: "simulated", sensorId: "GL-SIM-017", note: "Khu chợ dân sinh đông đúc." },
  { name: "Quận 4 - Cầu Khánh Hội", district: "Quận 4", lat: 10.7622, lng: 106.7044, basePm25: 54, sourceType: "simulated", sensorId: "GL-SIM-018", note: "Khu vực cảng, gần sông." },
  { name: "Gò Vấp - Ngã 5 Chuồng Chó", district: "Gò Vấp", lat: 10.8386, lng: 106.6848, basePm25: 72, sourceType: "simulated", sensorId: "GL-SIM-019", note: "Nút giao đông phương tiện hai bánh." },
  { name: "Khu công nghệ cao (SHTP)", district: "Thủ Đức", lat: 10.8411, lng: 106.8098, basePm25: 46, sourceType: "simulated", sensorId: "GL-SIM-020", note: "Khu công nghệ cao, quy hoạch cây xanh." },
  { name: "Công viên 23/9", district: "Quận 1", lat: 10.7699, lng: 106.6927, basePm25: 50, sourceType: "estimated", sensorId: null, note: "Giá trị nội suy từ các điểm lân cận, chưa có cảm biến tại chỗ." },
  { name: "Cầu Thị Nghè", district: "Bình Thạnh", lat: 10.7889, lng: 106.7107, basePm25: 56, sourceType: "estimated", sensorId: null, note: "Giá trị nội suy giữa Thảo Cầm Viên và Hàng Xanh." },
  { name: "Ngã sáu Cộng Hòa", district: "Tân Bình", lat: 10.7909, lng: 106.6516, basePm25: 69, sourceType: "estimated", sensorId: null, note: "Giá trị ước tính, chưa có điểm đo trực tiếp." },
];
