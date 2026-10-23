import {
  pgTable,
  serial,
  varchar,
  doublePrecision,
  timestamp,
  integer,
  boolean,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Monitoring stations — structured to support future ESP32 + PMS7003/BME280
// sensor readings. For the MVP, rows are populated with clearly labelled
// simulated / estimated data (see /ve-du-lieu for the full disclosure).
// ---------------------------------------------------------------------------
export const monitoringStations = pgTable("monitoring_stations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  district: varchar("district", { length: 120 }).notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  pm25: doublePrecision("pm25").notNull(),
  temperature: doublePrecision("temperature"),
  humidity: doublePrecision("humidity"),
  sourceType: varchar("source_type", { length: 20 }).notNull(), // 'simulated' | 'estimated' | 'measured'
  sensorId: varchar("sensor_id", { length: 50 }),
  note: varchar("note", { length: 255 }),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Logged route searches (comparison history) — every time a user presses
// "Tìm tuyến đường" we store a snapshot of the computed alternatives.
// ---------------------------------------------------------------------------
export const routeSearches = pgTable("route_searches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().default("demo-user"),
  startLabel: varchar("start_label", { length: 255 }).notNull(),
  startLat: doublePrecision("start_lat").notNull(),
  startLng: doublePrecision("start_lng").notNull(),
  endLabel: varchar("end_label", { length: 255 }).notNull(),
  endLat: doublePrecision("end_lat").notNull(),
  endLng: doublePrecision("end_lng").notNull(),
  preference: integer("preference").notNull(),
  sensitiveMode: boolean("sensitive_mode").notNull().default(false),
  resultsJson: jsonb("results_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Saved routes — a favourited route coming from a search result.
// ---------------------------------------------------------------------------
export const savedRoutes = pgTable("saved_routes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().default("demo-user"),
  name: varchar("name", { length: 255 }).notNull(),
  startLabel: varchar("start_label", { length: 255 }).notNull(),
  startLat: doublePrecision("start_lat").notNull(),
  startLng: doublePrecision("start_lng").notNull(),
  endLabel: varchar("end_label", { length: 255 }).notNull(),
  endLat: doublePrecision("end_lat").notNull(),
  endLng: doublePrecision("end_lng").notNull(),
  distanceKm: doublePrecision("distance_km").notNull(),
  durationMin: doublePrecision("duration_min").notNull(),
  pm25Estimate: doublePrecision("pm25_estimate"),
  extraTimeMin: doublePrecision("extra_time_min").notNull().default(0),
  routeType: varchar("route_type", { length: 20 }).notNull(), // 'fastest' | 'cleaner' | 'balanced'
  confidence: varchar("confidence", { length: 10 }).notNull(), // 'high' | 'medium' | 'low'
  pathJson: jsonb("path_json").notNull(), // [[lat,lng], ...]
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Personal alert settings (single demo user — no auth in this MVP).
// ---------------------------------------------------------------------------
export const alertSettings = pgTable("alert_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique().default("demo-user"),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  pm25Threshold: doublePrecision("pm25_threshold").notNull().default(55),
  sensitiveMode: boolean("sensitive_mode").notNull().default(false),
  preferredStartTime: varchar("preferred_start_time", { length: 5 }).notNull().default("07:00"),
  preferredEndTime: varchar("preferred_end_time", { length: 5 }).notNull().default("08:00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Environmental / air-quality reports submitted by users.
// ---------------------------------------------------------------------------
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().default("demo-user"),
  category: varchar("category", { length: 50 }).notNull(),
  locationLabel: varchar("location_label", { length: 255 }).notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  description: text("description").notNull(),
  photoDataUrl: text("photo_data_url"),
  status: varchar("status", { length: 20 }).notNull().default("Đã tiếp nhận"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Green Points — simulated gamification ledger.
// ---------------------------------------------------------------------------
export const greenPointsActivities = pgTable("green_points_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().default("demo-user"),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  points: integer("points").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
