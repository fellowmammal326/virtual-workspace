import React, { useRef, useEffect } from 'react';
import { useWindowSystem } from '@/hooks/useWindowSystem';
import Draggable from 'react-draggable';
import * as LucideIcons from 'lucide-react';

interface WindowProps {
  id: string;
  AppComponent: React.FC;
}

const Window: React.FC<WindowProps> = ({ id, AppComponent }) => {
  const {
    windows,
    activateWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
  } = useWindowSystem();

  const windowRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const window = windows.find(w => w.id === id);

  if (!window || !window.isOpen) {
    return null;
  }

  const IconComponent = (LucideIcons as Record<string, any>)[
    window.icon.charAt(0).toUpperCase() + window.icon.slice(1)
  ] || LucideIcons.Square;

  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    updateWindowPosition(id, data.x, data.y);
  };

  // Determine window style based on state
  const getWindowStyle = () => {
    if (window.isMaximized) {
      return {
        width: '100%',
        height: 'calc(100vh - 3rem)', // Subtract taskbar height
        top: 0,
        left: 0,
        borderRadius: 0,
      };
    }

    return {
      width: `${window.width}px`,
      height: `${window.height}px`,
      top: `${window.y}px`,
      left: `${window.x}px`,
      zIndex: window.zIndex,
    };
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".draggable-header"
      bounds="parent"
      position={window.isMaximized ? { x: 0, y: 0 } : { x: window.x, y: window.y }}
      onStop={handleDragStop}
      disabled={window.isMaximized}
    >
      <div
        ref={nodeRef}
        className={`window absolute bg-white rounded shadow-lg ${window.isMaximized ? 'rounded-none' : ''}`}
        style={getWindowStyle()}
        onMouseDown={() => activateWindow(id)}
      >
        <div
          ref={headerRef}
          className="draggable-header window-header bg-window-header text-white p-2 flex justify-between items-center"
        >
          <div className="flex items-center">
            <IconComponent className="mr-2 h-4 w-4" />
            <span>{window.title}</span>
          </div>
          <div className="flex">
            <button
              className="window-header-btn px-3 py-1 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(id);
              }}
            >
              <LucideIcons.Minus className="h-4 w-4" />
            </button>
            <button
              className="window-header-btn px-3 py-1 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                window.isMaximized ? restoreWindow(id) : maximizeWindow(id);
              }}
            >
              {window.isMaximized ? (
                <LucideIcons.Minimize2 className="h-4 w-4" />
              ) : (
                <LucideIcons.Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              className="window-close-btn px-3 py-1 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(id);
              }}
            >
              <LucideIcons.X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="window-content" style={{ height: 'calc(100% - 2.5rem)' }}>
          <AppComponent />
        </div>
      </div>
    </Draggable>
  );
};

export default Window;
