import React from 'react';
import { Icon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface DesktopIconProps {
  id: string;
  title: string;
  icon: string;
  selected?: boolean;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  title,
  icon,
  selected = false,
  onClick,
}) => {
  // Get icon component from Lucide icons
  const IconComponent = (LucideIcons as Record<string, Icon>)[
    icon.charAt(0).toUpperCase() + icon.slice(1)
  ] || LucideIcons.File;

  return (
    <div
      className={`desktop-icon w-20 flex flex-col items-center justify-center text-center p-2 rounded cursor-pointer ${
        selected ? 'selected' : ''
      }`}
      data-app={id}
      onClick={onClick}
    >
      <div className="text-primary text-3xl mb-1">
        <IconComponent size={32} />
      </div>
      <span className="text-xs">{title}</span>
    </div>
  );
};

export default DesktopIcon;
