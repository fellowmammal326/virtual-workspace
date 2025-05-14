import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  googleRefreshToken: text("google_refresh_token"),
});

export const windowStates = pgTable("window_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  windowId: text("window_id").notNull(),
  position: jsonb("position").notNull(),
  size: jsonb("size").notNull(),
  isOpen: boolean("is_open").notNull().default(false),
  isMaximized: boolean("is_maximized").notNull().default(false),
});

export const browserBookmarks = pgTable("browser_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  createdAt: text("created_at").notNull(),
});

// App store tables
export const storeApps = pgTable("store_apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  screenshots: jsonb("screenshots").notNull(),
  version: text("version").notNull(),
  size: integer("size").notNull(), // Size in KB
  category: text("category").notNull(),
  publisher: text("publisher").notNull(),
  contentRating: text("content_rating").notNull().default("Everyone"),
  price: text("price").notNull().default("Free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userInstalledApps = pgTable("user_installed_apps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  appId: integer("app_id").notNull().references(() => storeApps.id),
  installedAt: timestamp("installed_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const appReviews = pgTable("app_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  appId: integer("app_id").notNull().references(() => storeApps.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWindowStateSchema = createInsertSchema(windowStates).omit({
  id: true,
});

export const insertBookmarkSchema = createInsertSchema(browserBookmarks).omit({
  id: true,
});

export const insertStoreAppSchema = createInsertSchema(storeApps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserInstalledAppSchema = createInsertSchema(userInstalledApps).omit({
  installedAt: true,
});

export const insertAppReviewSchema = createInsertSchema(appReviews).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WindowState = typeof windowStates.$inferSelect;
export type InsertWindowState = z.infer<typeof insertWindowStateSchema>;
export type BrowserBookmark = typeof browserBookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type StoreApp = typeof storeApps.$inferSelect;
export type InsertStoreApp = z.infer<typeof insertStoreAppSchema>;
export type UserInstalledApp = typeof userInstalledApps.$inferSelect;
export type InsertUserInstalledApp = z.infer<typeof insertUserInstalledAppSchema>;
export type AppReview = typeof appReviews.$inferSelect;
export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
