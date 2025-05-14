import { 
  users, type User, type InsertUser, 
  windowStates, type WindowState, type InsertWindowState, 
  browserBookmarks, type BrowserBookmark, type InsertBookmark,
  storeApps, type StoreApp, type InsertStoreApp,
  userInstalledApps, type UserInstalledApp, type InsertUserInstalledApp,
  appReviews, type AppReview, type InsertAppReview
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // WindowState operations
  getWindowStates(userId: number): Promise<WindowState[]>;
  saveWindowState(windowState: InsertWindowState): Promise<WindowState>;
  updateWindowState(id: number, windowState: Partial<WindowState>): Promise<WindowState | undefined>;
  deleteWindowState(id: number): Promise<void>;
  
  // Bookmark operations
  getBookmarks(userId: number): Promise<BrowserBookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<BrowserBookmark>;
  deleteBookmark(id: number): Promise<void>;
  
  // App Store operations
  getAllApps(): Promise<StoreApp[]>;
  getAppById(id: number): Promise<StoreApp | undefined>;
  createApp(app: InsertStoreApp): Promise<StoreApp>;
  updateApp(id: number, app: Partial<StoreApp>): Promise<StoreApp | undefined>;
  deleteApp(id: number): Promise<void>;
  
  // User Installed Apps operations
  getUserInstalledApps(userId: number): Promise<StoreApp[]>;
  installApp(install: InsertUserInstalledApp): Promise<UserInstalledApp>;
  uninstallApp(id: number): Promise<void>;
  
  // App Reviews operations
  getAppReviews(appId: number): Promise<AppReview[]>;
  createAppReview(review: InsertAppReview): Promise<AppReview>;
  deleteAppReview(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // WindowState operations
  async getWindowStates(userId: number): Promise<WindowState[]> {
    return await db.select().from(windowStates).where(eq(windowStates.userId, userId));
  }
  
  async saveWindowState(windowState: InsertWindowState): Promise<WindowState> {
    const [state] = await db.insert(windowStates).values(windowState).returning();
    return state;
  }
  
  async updateWindowState(id: number, windowState: Partial<WindowState>): Promise<WindowState | undefined> {
    const [updatedState] = await db
      .update(windowStates)
      .set(windowState)
      .where(eq(windowStates.id, id))
      .returning();
    return updatedState;
  }
  
  async deleteWindowState(id: number): Promise<void> {
    await db.delete(windowStates).where(eq(windowStates.id, id));
  }
  
  // Bookmark operations
  async getBookmarks(userId: number): Promise<BrowserBookmark[]> {
    return await db.select().from(browserBookmarks).where(eq(browserBookmarks.userId, userId));
  }
  
  async createBookmark(bookmark: InsertBookmark): Promise<BrowserBookmark> {
    const [newBookmark] = await db.insert(browserBookmarks).values(bookmark).returning();
    return newBookmark;
  }
  
  async deleteBookmark(id: number): Promise<void> {
    await db.delete(browserBookmarks).where(eq(browserBookmarks.id, id));
  }
  
  // App Store operations
  async getAllApps(): Promise<StoreApp[]> {
    return await db.select().from(storeApps);
  }
  
  async getAppById(id: number): Promise<StoreApp | undefined> {
    const [app] = await db.select().from(storeApps).where(eq(storeApps.id, id));
    return app;
  }
  
  async createApp(app: InsertStoreApp): Promise<StoreApp> {
    const [newApp] = await db.insert(storeApps).values(app).returning();
    return newApp;
  }
  
  async updateApp(id: number, app: Partial<StoreApp>): Promise<StoreApp | undefined> {
    const [updatedApp] = await db
      .update(storeApps)
      .set(app)
      .where(eq(storeApps.id, id))
      .returning();
    return updatedApp;
  }
  
  async deleteApp(id: number): Promise<void> {
    await db.delete(storeApps).where(eq(storeApps.id, id));
  }
  
  // User Installed Apps operations
  async getUserInstalledApps(userId: number): Promise<StoreApp[]> {
    // Use plain SQL
    const { rows } = await db.session.query(
      'SELECT app_id FROM user_installed_apps WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    
    const installedApps: StoreApp[] = [];
    
    // For each installed app ID, fetch the app details
    for (const row of rows) {
      const appId = row.app_id as number;
      const app = await this.getAppById(appId);
      if (app) {
        installedApps.push(app);
      }
    }
    
    return installedApps;
  }
  
  async installApp(install: InsertUserInstalledApp): Promise<UserInstalledApp> {
    const [installedApp] = await db.insert(userInstalledApps).values(install).returning();
    return installedApp;
  }
  
  async uninstallApp(id: number): Promise<void> {
    await db.delete(userInstalledApps).where(eq(userInstalledApps.id, id));
  }
  
  // App Reviews operations
  async getAppReviews(appId: number): Promise<AppReview[]> {
    return await db.select().from(appReviews).where(eq(appReviews.appId, appId));
  }
  
  async createAppReview(review: InsertAppReview): Promise<AppReview> {
    const [newReview] = await db.insert(appReviews).values(review).returning();
    return newReview;
  }
  
  async deleteAppReview(id: number): Promise<void> {
    await db.delete(appReviews).where(eq(appReviews.id, id));
  }
}

export const storage = new DatabaseStorage();
