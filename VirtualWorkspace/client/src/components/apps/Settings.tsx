import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useTheme } from '@/components/ui/theme-provider';
import { useWallpaper, builtInWallpapers } from '@/hooks/useWallpaper';
import {
  User,
  Dock,
  Globe,
  Cloud,
  Lock,
  Puzzle,
  Bell,
  Info,
  Key,
  Smartphone,
  RotateCw,
  Search,
  Image,
  Upload,
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

// Wallpaper settings component
const WallpaperSettings = () => {
  const { toast } = useToast();
  const { 
    currentWallpaper, 
    wallpaperList, 
    setWallpaper,
    setCustomWallpaper 
  } = useWallpaper();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleWallpaperSelect = (wallpaperId: string) => {
    setWallpaper(wallpaperId);
    toast({
      title: 'Wallpaper changed',
      description: 'Desktop background has been updated',
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }
    
    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);
    setCustomWallpaper(imageUrl);
    
    toast({
      title: 'Custom wallpaper set',
      description: 'Your image has been set as the desktop background',
    });
  };
  
  return (
    <>
      <h3 className="font-semibold text-lg mb-3">Wallpaper</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {wallpaperList.map((wallpaper) => (
          <div 
            key={wallpaper.id}
            className={`
              relative cursor-pointer rounded-lg overflow-hidden h-24
              ${currentWallpaper === wallpaper.id ? 'ring-2 ring-win-blue' : 'hover:opacity-90'}
            `}
            onClick={() => handleWallpaperSelect(wallpaper.id)}
          >
            <div 
              className="absolute inset-0" 
              style={{ 
                background: wallpaper.type === 'gradient' ? wallpaper.url : '',
                backgroundImage: wallpaper.type !== 'gradient' ? `url(${wallpaper.url})` : '',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2">
              {wallpaper.name}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between bg-white p-3 rounded border mb-3">
        <div className="flex items-center">
          <Image className="mr-3 text-win-blue h-5 w-5" />
          <span>Custom Wallpaper</span>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            <span>Upload Image</span>
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        Upload your own image to use as desktop background. For best results, use images with a resolution of at least 1920x1080 pixels.
      </p>
    </>
  );
};

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, authenticate } = useGoogleDrive();
  const [activeSection, setActiveSection] = useState('accounts');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample user data - in a real app, this would come from a user context or API
  const user = {
    name: 'User',
    email: 'user@example.com',
    avatarUrl: null,
  };

  // Settings sections
  const sections = [
    { id: 'accounts', name: 'Accounts', icon: User },
    { id: 'personalization', name: 'Personalization', icon: Dock },
    { id: 'network', name: 'Network', icon: Globe },
    { id: 'google-drive', name: 'Google Drive', icon: Cloud },
    { id: 'privacy', name: 'Privacy & Security', icon: Lock },
    { id: 'apps', name: 'Apps', icon: Puzzle },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'about', name: 'About', icon: Info },
  ];

  // Filter sections based on search query
  const filteredSections = searchQuery
    ? sections.filter(section => 
        section.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  const handleSaveChanges = () => {
    toast({
      title: 'Settings saved',
      description: 'Your changes have been successfully saved.',
    });
  };

  const handleGoogleDriveToggle = () => {
    if (!isAuthenticated) {
      authenticate();
    } else {
      toast({
        title: 'Google Drive disconnection',
        description: 'This feature is not implemented in the demo.',
      });
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Render settings content based on active section
  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'accounts':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">Accounts</h2>
            
            <div className="bg-white rounded-lg border p-4 mb-4">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-win-blue flex items-center justify-center text-white text-xl mr-4">
                  <User />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-win-blue cursor-pointer hover:underline mt-1">
                    Manage your Google Account
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-3">Sign-in options</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <Key className="mr-3 text-win-blue h-5 w-5" />
                  <span>Password</span>
                </div>
                <Button variant="link">Change</Button>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <Smartphone className="mr-3 text-win-blue h-5 w-5" />
                  <span>Two-factor authentication</span>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <FaGoogle className="mr-3 text-win-blue text-lg" />
                  <span>Google Drive Integration</span>
                </div>
                <Switch checked={isAuthenticated} onCheckedChange={handleGoogleDriveToggle} />
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <RotateCw className="mr-3 text-win-blue h-5 w-5" />
                  <span>Sync settings across devices</span>
                </div>
                <Switch checked={true} />
              </div>
            </div>
          </>
        );
        
      case 'personalization':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">Personalization</h2>
            
            <h3 className="font-semibold text-lg mb-3">Theme</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <Dock className="mr-3 text-win-blue h-5 w-5" />
                  <span>Dark Mode</span>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={handleThemeToggle} />
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <Dock className="mr-3 text-win-blue h-5 w-5" />
                  <span>Accent Color</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-6 h-6 rounded-full bg-purple-500 cursor-pointer"></div>
                  <div className="w-6 h-6 rounded-full bg-red-500 cursor-pointer"></div>
                  <div className="w-6 h-6 rounded-full bg-green-500 cursor-pointer"></div>
                </div>
              </div>
            </div>
            
            <WallpaperSettings />
          </>
        );
        
      case 'google-drive':
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">Google Drive</h2>
            
            <div className="bg-white rounded-lg border p-4 mb-4">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <FaGoogle className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Google Drive Integration</h3>
                  <p className="text-gray-600">
                    {isAuthenticated 
                      ? 'Your account is connected to Google Drive'
                      : 'Connect to access your Google Drive files'}
                  </p>
                  <Button 
                    variant={isAuthenticated ? "outline" : "default"}
                    className="mt-2" 
                    onClick={handleGoogleDriveToggle}
                  >
                    {isAuthenticated ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
            </div>
            
            {isAuthenticated && (
              <>
                <h3 className="font-semibold text-lg mb-3">Storage</h3>
                <div className="bg-white rounded-lg border p-4">
                  <div className="h-2 bg-gray-200 rounded-full mb-2">
                    <div className="h-2 bg-blue-500 rounded-full w-2/3"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10.5 GB used</span>
                    <span>15 GB total</span>
                  </div>
                </div>
              </>
            )}
          </>
        );
        
      default:
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">
              {sections.find(s => s.id === activeSection)?.name || 'Settings'}
            </h2>
            <div className="bg-white rounded-lg border p-6 text-center">
              <Info className="mx-auto h-12 w-12 text-win-blue mb-3" />
              <p className="text-lg mb-2">This section is not implemented in the demo</p>
              <p className="text-gray-600">Settings functionality would appear here in a complete application.</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-win-bg border-r">
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center bg-white border rounded px-2 py-1">
              <Search className="text-gray-400 mr-2 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Find a setting" 
                className="border-0 p-0 text-sm h-6 focus:ring-0 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-win-blue text-white'
                    : 'hover:bg-win-bg-alt'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="mr-2 h-4 w-4" />
                <span>{section.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6">
        {renderSettingsContent()}
        
        {['accounts', 'personalization', 'privacy', 'google-drive'].includes(activeSection) && (
          <Button className="mt-6 bg-win-blue hover:bg-win-blue-dark" onClick={handleSaveChanges}>
            Save changes
          </Button>
        )}
      </div>
    </div>
  );
};

export default Settings;
