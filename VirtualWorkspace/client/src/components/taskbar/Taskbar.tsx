import React, { useState, useEffect } from 'react';
import StartMenu from './StartMenu';
import { useWindowSystem } from '@/hooks/useWindowSystem';
import * as LucideIcons from 'lucide-react';

const Taskbar: React.FC = () => {
  const { windows, openWindow, isWindowOpen } = useWindowSystem();
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleStartMenu = () => {
    setStartMenuVisible(!startMenuVisible);
  };

  // Format time for display in taskbar
  const formatTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Format date for display in taskbar
  const formatDate = () => {
    return `${currentTime.getMonth() + 1}/${currentTime.getDate()}`;
  };

  // Close start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        startMenuVisible &&
        !(e.target as Element).closest('#start-menu') &&
        !(e.target as Element).closest('#start-button')
      ) {
        setStartMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [startMenuVisible]);

  // Taskbar apps
  const taskbarApps = [
    { id: 'file-explorer', icon: 'Folder' },
    { id: 'browser', icon: 'Globe' },
    { id: 'app-store', icon: 'Store' },
    { id: 'settings', icon: 'Settings' },
  ];

  return (
    <>
      <div className="taskbar">
        <button
          id="start-button"
          className="taskbar-icon h-10 w-10 flex items-center justify-center rounded hover:bg-gray-700"
          onClick={toggleStartMenu}
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M11 11V5H5v6h6zm0 0v6h-6v-6h6zm1 0h6V5h-6v6zm0 0v6h6v-6h-6z"
            />
          </svg>
        </button>

        <div className="taskbar-divider mx-2 h-6 border-l border-gray-600"></div>

        {/* Pinned apps */}
        <div className="flex">
          {taskbarApps.map(app => {
            const IconComponent = (LucideIcons as Record<string, any>)[app.icon];
            const isOpen = isWindowOpen(app.id);
            
            return (
              <button
                key={app.id}
                className={`taskbar-icon h-10 w-10 flex items-center justify-center rounded hover:bg-gray-700 ${
                  isOpen ? 'border-b-2 border-primary' : ''
                }`}
                onClick={() => openWindow(app.id)}
              >
                <IconComponent className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        <div className="flex-1"></div>

        {/* System tray */}
        <div className="flex items-center">
          <button className="taskbar-icon h-10 px-1 flex items-center justify-center rounded hover:bg-gray-700">
            <LucideIcons.ChevronUp className="h-4 w-4 mr-1" />
          </button>
          <button className="taskbar-icon h-10 px-2 flex items-center justify-center rounded hover:bg-gray-700">
            <LucideIcons.Wifi className="h-4 w-4" />
          </button>
          <button className="taskbar-icon h-10 px-2 flex items-center justify-center rounded hover:bg-gray-700">
            <LucideIcons.Volume2 className="h-4 w-4" />
          </button>
          <button className="taskbar-icon h-10 px-2 flex items-center justify-center rounded hover:bg-gray-700">
            <LucideIcons.Battery className="h-4 w-4" />
          </button>
          <div className="taskbar-icon h-10 px-3 flex items-center justify-center rounded hover:bg-gray-700">
            <span id="taskbar-time" className="text-sm">{formatTime()}</span>
            <span id="taskbar-date" className="text-sm ml-1">{formatDate()}</span>
          </div>
          <button className="taskbar-icon h-10 w-3 flex items-center justify-center rounded hover:bg-gray-700"></button>
        </div>
      </div>

      {/* Start Menu */}
      {startMenuVisible && <StartMenu onAppClick={(id) => { openWindow(id); setStartMenuVisible(false); }} />}
    </>
  );
};

export default Taskbar;
