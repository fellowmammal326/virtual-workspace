import { useState, useContext, createContext, ReactNode } from 'react';
import { WindowState } from '@/lib/types';

interface WindowSystemContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  zIndexCounter: number;
  addWindow: (windowConfig: Partial<WindowState>) => string;
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  activateWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  isWindowOpen: (id: string) => boolean;
}

const WindowSystemContext = createContext<WindowSystemContextType | undefined>(undefined);

const DEFAULT_WINDOWS: WindowState[] = [
  {
    id: 'file-explorer',
    title: 'File Explorer',
    icon: 'folder',
    app: 'file-explorer',
    isOpen: false,
    isActive: false,
    isMinimized: false,
    isMaximized: false,
    width: 800,
    height: 500,
    x: 50,
    y: 50,
    zIndex: 10,
  },
  {
    id: 'browser',
    title: 'Web Browser',
    icon: 'globe',
    app: 'browser',
    isOpen: false,
    isActive: false,
    isMinimized: false,
    isMaximized: false,
    width: 900,
    height: 600,
    x: 150,
    y: 70,
    zIndex: 10,
  },
  {
    id: 'app-store',
    title: 'App Store',
    icon: 'store',
    app: 'app-store',
    isOpen: false,
    isActive: false,
    isMinimized: false,
    isMaximized: false,
    width: 850,
    height: 550,
    x: 100,
    y: 80,
    zIndex: 10,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'cog',
    app: 'settings',
    isOpen: false,
    isActive: false,
    isMinimized: false,
    isMaximized: false,
    width: 750,
    height: 500,
    x: 200,
    y: 100,
    zIndex: 10,
  },
];

export function WindowSystemProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>(DEFAULT_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(100);

  const addWindow = (windowConfig: Partial<WindowState>): string => {
    const id = windowConfig.id || `window-${Date.now()}`;
    
    const newWindow: WindowState = {
      id,
      title: windowConfig.title || 'New Window',
      icon: windowConfig.icon || 'window',
      app: windowConfig.app || 'default',
      isOpen: windowConfig.isOpen !== undefined ? windowConfig.isOpen : true,
      isActive: windowConfig.isActive !== undefined ? windowConfig.isActive : true,
      isMinimized: windowConfig.isMinimized || false,
      isMaximized: windowConfig.isMaximized || false,
      width: windowConfig.width || 600,
      height: windowConfig.height || 400,
      x: windowConfig.x || 100,
      y: windowConfig.y || 100,
      zIndex: windowConfig.zIndex || zIndexCounter,
    };

    setWindows(prev => [...prev, newWindow]);
    if (newWindow.isActive) {
      setActiveWindowId(id);
    }
    if (newWindow.isOpen && newWindow.isActive) {
      setZIndexCounter(prev => prev + 1);
    }

    return id;
  };

  const openWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { 
              ...window, 
              isOpen: true, 
              isMinimized: false, 
              isActive: true, 
              zIndex: zIndexCounter 
            } 
          : { 
              ...window, 
              isActive: false 
            }
      )
    );
    setActiveWindowId(id);
    setZIndexCounter(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isOpen: false, isActive: false } 
          : window
      )
    );
    
    // Set next active window if needed
    if (activeWindowId === id) {
      const openWindows = windows.filter(w => w.isOpen && w.id !== id);
      if (openWindows.length > 0) {
        // Sort by z-index and get the highest
        const nextActive = [...openWindows].sort((a, b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(nextActive.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isMinimized: true, isActive: false } 
          : window
      )
    );
    
    // Set next active window
    if (activeWindowId === id) {
      const openWindows = windows.filter(w => w.isOpen && !w.isMinimized && w.id !== id);
      if (openWindows.length > 0) {
        // Sort by z-index and get the highest
        const nextActive = [...openWindows].sort((a, b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(nextActive.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isMaximized: true, isActive: true, zIndex: zIndexCounter } 
          : { ...window, isActive: false }
      )
    );
    setActiveWindowId(id);
    setZIndexCounter(prev => prev + 1);
  };

  const restoreWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isMaximized: false, isActive: true, zIndex: zIndexCounter } 
          : { ...window, isActive: false }
      )
    );
    setActiveWindowId(id);
    setZIndexCounter(prev => prev + 1);
  };

  const activateWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isActive: true, zIndex: zIndexCounter } 
          : { ...window, isActive: false }
      )
    );
    setActiveWindowId(id);
    setZIndexCounter(prev => prev + 1);
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, x, y } 
          : window
      )
    );
  };

  const updateWindowSize = (id: string, width: number, height: number) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, width, height } 
          : window
      )
    );
  };

  const isWindowOpen = (id: string) => {
    const window = windows.find(w => w.id === id);
    return window ? window.isOpen : false;
  };

  return (
    <WindowSystemContext.Provider
      value={{
        windows,
        activeWindowId,
        zIndexCounter,
        addWindow,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        activateWindow,
        updateWindowPosition,
        updateWindowSize,
        isWindowOpen
      }}
    >
      {children}
    </WindowSystemContext.Provider>
  );
}

export function useWindowSystem() {
  const context = useContext(WindowSystemContext);
  if (context === undefined) {
    throw new Error('useWindowSystem must be used within a WindowSystemProvider');
  }
  return context;
}