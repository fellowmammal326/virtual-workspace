import React, { useState, useMemo } from 'react';
import DesktopIcon from './DesktopIcon';
import { useWindowSystem } from '@/hooks/useWindowSystem';
import { useWallpaper, builtInWallpapers } from '@/hooks/useWallpaper';

interface DesktopProps {
  className?: string;
}

const Desktop: React.FC<DesktopProps> = ({ className }) => {
  const { openWindow } = useWindowSystem();
  const { currentWallpaper, customWallpaperUrl } = useWallpaper();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleIconClick = (id: string) => {
    setSelectedIcon(id);
    openWindow(id);
  };

  const desktopApps = [
    { id: 'file-explorer', title: 'File Explorer', icon: 'folder' },
    { id: 'browser', title: 'Web Browser', icon: 'globe' },
    { id: 'app-store', title: 'App Store', icon: 'store' },
    { id: 'settings', title: 'Settings', icon: 'cog' },
  ];

  // Handle background click to deselect icons
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('desktop')) {
      setSelectedIcon(null);
    }
  };

  // Get current wallpaper style
  const wallpaperStyle = useMemo(() => {
    if (currentWallpaper === 'custom' && customWallpaperUrl) {
      return {
        backgroundImage: `url(${customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }

    // Find the selected wallpaper from built-in options
    const selectedWallpaper = builtInWallpapers.find(w => w.id === currentWallpaper);
    if (selectedWallpaper) {
      if (selectedWallpaper.type === 'gradient') {
        return {
          background: selectedWallpaper.url
        };
      } else {
        return {
          backgroundImage: `url(${selectedWallpaper.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
    }
    
    // Fallback
    return { 
      background: builtInWallpapers[0].url 
    };
  }, [currentWallpaper, customWallpaperUrl]);

  return (
    <div 
      className={`desktop ${className || ''}`} 
      onClick={handleBackgroundClick}
      style={wallpaperStyle}
    >
      <div className="absolute top-4 left-4 grid grid-cols-1 gap-6">
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            title={app.title}
            icon={app.icon}
            selected={selectedIcon === app.id}
            onClick={() => handleIconClick(app.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Desktop;
