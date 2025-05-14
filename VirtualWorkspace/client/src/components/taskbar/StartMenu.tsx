import React from 'react';
import * as LucideIcons from 'lucide-react';
import { FaWindows } from 'react-icons/fa';
import { Input } from '@/components/ui/input';

interface StartMenuProps {
  onAppClick: (id: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onAppClick }) => {
  // Define apps to show in the start menu
  const pinnedApps = [
    { id: 'file-explorer', name: 'Files', icon: 'Folder' },
    { id: 'browser', name: 'Browser', icon: 'Globe' },
    { id: 'app-store', name: 'App Store', icon: 'Store' },
    { id: 'settings', name: 'Settings', icon: 'Settings' },
    { id: 'mail', name: 'Mail', icon: 'Mail' },
    { id: 'calendar', name: 'Calendar', icon: 'Calendar' },
  ];

  const recentApps = [
    { id: 'chrome', name: 'Google Chrome', icon: 'Chrome' },
    { id: 'slack', name: 'Slack', icon: 'MessageSquare' },
    { id: 'word', name: 'Microsoft Word', icon: 'FileText' },
  ];

  const powerOptions = [
    { id: 'power', name: 'Shut down', icon: 'Power', color: 'text-red-400' },
    { id: 'restart', name: 'Restart', icon: 'RotateCcw', color: 'text-yellow-400' },
    { id: 'logout', name: 'Sign out', icon: 'LogOut', color: 'text-green-400' },
  ];

  return (
    <div
      id="start-menu"
      className="start-menu absolute left-0 bottom-12 w-96 bg-[#202020] border border-gray-700 shadow-lg rounded-tr-lg rounded-tl-lg"
      style={{ transform: 'scaleY(1)', display: 'block' }}
    >
      <div className="p-4">
        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center bg-gray-800 rounded px-3 py-2">
            <LucideIcons.Search className="text-gray-400 mr-2 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Type here to search" 
              className="bg-transparent border-none text-white w-full focus:outline-none focus:ring-0 h-6 p-0"
            />
          </div>
        </div>

        {/* Pinned Apps */}
        <h3 className="text-gray-400 text-xs font-semibold mb-2 uppercase">Pinned</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {pinnedApps.map((app) => {
            const IconComponent = (LucideIcons as Record<string, any>)[app.icon] || LucideIcons.App;
            return (
              <div
                key={app.id}
                className="app-icon flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-2 rounded cursor-pointer"
                data-app={app.id}
                onClick={() => onAppClick(app.id)}
              >
                <IconComponent className="text-blue-400 h-6 w-6 mb-1" />
                <span className="text-white text-xs">{app.name}</span>
              </div>
            );
          })}
        </div>

        {/* Recent Apps */}
        <h3 className="text-gray-400 text-xs font-semibold mb-2 uppercase">Recent</h3>
        <div className="space-y-2">
          {recentApps.map((app) => {
            const IconComponent = (LucideIcons as Record<string, any>)[app.icon] || LucideIcons.App;
            return (
              <div
                key={app.id}
                className="flex items-center bg-gray-800 hover:bg-gray-700 p-2 rounded cursor-pointer"
                onClick={() => onAppClick(app.id)}
              >
                <IconComponent className="text-blue-400 mr-3 h-5 w-5" />
                <span className="text-white">{app.name}</span>
              </div>
            );
          })}
        </div>

        {/* Power options */}
        <div className="mt-4 pt-3 border-t border-gray-700 flex">
          {powerOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center text-white hover:bg-gray-700 p-2 rounded cursor-pointer mr-3"
            >
              <LucideIcons.Power className={`${option.color} mr-2 h-4 w-4`} />
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
