import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define available wallpapers
export const builtInWallpapers = [
  {
    id: 'default',
    name: 'Default',
    url: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', // Default gradient
    type: 'gradient'
  },
  {
    id: 'blue',
    name: 'Blue',
    url: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    type: 'gradient'
  },
  {
    id: 'purple',
    name: 'Purple',
    url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient'
  },
  {
    id: 'green',
    name: 'Green',
    url: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
    type: 'gradient'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    url: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
    type: 'gradient'
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'linear-gradient(to bottom, #3d3d3d 0%, #222222 100%)',
    type: 'gradient'
  }
];

interface WallpaperContextType {
  currentWallpaper: string;
  wallpaperList: typeof builtInWallpapers;
  customWallpaperUrl: string | null;
  setWallpaper: (wallpaperId: string) => void;
  setCustomWallpaper: (url: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

interface WallpaperProviderProps {
  children: ReactNode;
}

export function WallpaperProvider({ children }: WallpaperProviderProps) {
  // Get stored wallpaper ID or use default
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(() => {
    const stored = localStorage.getItem('wallpaper');
    return stored || 'default';
  });
  
  // Custom wallpaper URL (if user uploads their own)
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(() => {
    return localStorage.getItem('customWallpaper');
  });

  // Update local storage when wallpaper changes
  useEffect(() => {
    localStorage.setItem('wallpaper', currentWallpaper);
  }, [currentWallpaper]);

  // Update local storage when custom wallpaper changes
  useEffect(() => {
    if (customWallpaperUrl) {
      localStorage.setItem('customWallpaper', customWallpaperUrl);
    } else {
      localStorage.removeItem('customWallpaper');
    }
  }, [customWallpaperUrl]);

  // Set wallpaper from built-in options
  const setWallpaper = (wallpaperId: string) => {
    setCurrentWallpaper(wallpaperId);
    // If selecting a built-in wallpaper, clear any custom one
    if (wallpaperId !== 'custom') {
      setCustomWallpaperUrl(null);
    }
  };

  // Set custom wallpaper
  const setCustomWallpaper = (url: string) => {
    setCustomWallpaperUrl(url);
    setCurrentWallpaper('custom');
  };

  const value = {
    currentWallpaper,
    wallpaperList: builtInWallpapers,
    customWallpaperUrl,
    setWallpaper,
    setCustomWallpaper
  };

  return (
    <WallpaperContext.Provider value={value}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
}