import React, { ReactNode } from 'react';
import { WindowSystemProvider } from '@/hooks/useWindowSystem';
import Window from './Window';
import FileExplorer from '@/components/apps/FileExplorer';
import Browser from '@/components/apps/Browser';
import AppStore from '@/components/apps/AppStore';
import Settings from '@/components/apps/Settings';

interface WindowManagerProps {
  children: ReactNode;
}

const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  // Map of app IDs to their component implementations
  const appComponents: Record<string, React.FC> = {
    'file-explorer': FileExplorer,
    'browser': Browser,
    'app-store': AppStore,
    'settings': Settings,
  };

  return (
    <WindowSystemProvider>
      {children}
      
      {/* Render Windows */}
      <Window id="file-explorer" AppComponent={appComponents['file-explorer']} />
      <Window id="browser" AppComponent={appComponents['browser']} />
      <Window id="app-store" AppComponent={appComponents['app-store']} />
      <Window id="settings" AppComponent={appComponents['settings']} />
    </WindowSystemProvider>
  );
};

export default WindowManager;
