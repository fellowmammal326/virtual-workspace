export interface WindowState {
  id: string;
  title: string;
  icon: string;
  app: string;
  isOpen: boolean;
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink: string;
  webViewLink: string;
  thumbnailLink?: string;
  parents?: string[];
  createdTime: string;
  modifiedTime: string;
  size?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  component: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
}

export interface StoreApp {
  id: number;
  name: string;
  description: string;
  icon: string;
  screenshots: string[];
  version: string;
  size: number;
  category: string;
  publisher: string;
  contentRating: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppReview {
  id: number;
  userId: number;
  appId: number;
  rating: number;
  review: string;
  createdAt: string;
}
