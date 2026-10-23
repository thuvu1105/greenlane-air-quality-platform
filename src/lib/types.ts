// ---------------------------------------------------------------------------
// Shared, strongly typed domain models used across the GreenLane app.
// ---------------------------------------------------------------------------

export type SourceType = "simulated" | "estimated" | "measured";
export type DataFreshness = "recent" | "stale";
export type RouteType = "fastest" | "cleaner" | "balanced";
export type Confidence = "high" | "medium" | "low";

export interface MonitoringStation {
  id: number;
  name: string;
  district: string;
  lat: number;
  lng: number;
  pm25: number;
  temperature: number | null;
  humidity: number | null;
  sourceType: SourceType;
  sensorId: string | null;
  note: string | null;
  recordedAt: string; // ISO
  freshness: DataFreshness;
  minutesAgo: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RoutePoint extends LatLng {
  label: string;
}

export interface RouteOption {
  id: string;
  routeType: RouteType;
  name: string;
  path: [number, number][]; // [lat, lng]
  distanceKm: number;
  durationMin: number;
  extraTimeMin: number;
  pm25Estimate: number | null;
  pm25SampleCount: number;
  confidence: Confidence;
  score: number;
  isRecommended: boolean;
  explanation: string;
  provider: "osrm" | "fallback-simulated";
}

export interface RouteSearchRequest {
  start: RoutePoint;
  end: RoutePoint;
  preference: number; // 0 (faster) .. 100 (cleaner)
  sensitiveMode: boolean;
}

export interface RouteSearchResponse {
  id: number | null;
  routes: RouteOption[];
  preference: number;
  sensitiveMode: boolean;
  generatedAt: string;
  disclaimer: string;
}

export interface SavedRoute {
  id: number;
  name: string;
  startLabel: string;
  startLat: number;
  startLng: number;
  endLabel: string;
  endLat: number;
  endLng: number;
  distanceKm: number;
  durationMin: number;
  pm25Estimate: number | null;
  extraTimeMin: number;
  routeType: RouteType;
  confidence: Confidence;
  path: [number, number][];
  createdAt: string;
}

export interface AlertSettings {
  notificationsEnabled: boolean;
  pm25Threshold: number;
  sensitiveMode: boolean;
  preferredStartTime: string;
  preferredEndTime: string;
  updatedAt: string;
}

export interface InAppAlert {
  id: string;
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  routeName?: string;
  createdAt: string;
}

export interface ReportItem {
  id: number;
  category: string;
  locationLabel: string;
  lat: number | null;
  lng: number | null;
  description: string;
  photoDataUrl: string | null;
  status: string;
  pointsAwarded: number;
  createdAt: string;
}

export interface GreenPointsActivity {
  id: number;
  activityType: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface GreenPointsSummary {
  balance: number;
  activities: GreenPointsActivity[];
}

export interface TrendPoint {
  hour: string;
  pm25: number;
}

export interface TrendSeries {
  district: string;
  points: TrendPoint[];
  isSample: true;
}
