// Client-safe constants shared by the Green Points service (server) and UI (client).
export const ACTIVITY_POINTS: Record<string, number> = {
  route_search: 5,
  save_route: 10,
  submit_report: 20,
  sensitive_mode_opt_in: 5,
  welcome_bonus: 50,
};

export const ACTIVITY_LABELS: Record<string, string> = {
  route_search: "So sánh tuyến đường",
  save_route: "Lưu một tuyến đường",
  submit_report: "Gửi báo cáo môi trường",
  sensitive_mode_opt_in: "Bật chế độ nhạy cảm",
  welcome_bonus: "Thưởng chào mừng GreenLane",
};
