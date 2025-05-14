import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { StoreApp } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Download, Check, Loader2 } from 'lucide-react';

const AppStore = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { 
    storeApps, 
    isLoadingStoreApps, 
    userApps, 
    isLoadingUserApps,
    installApp,
    isInstallingApp,
    uninstallApp,
    isUninstallingApp
  } = useAppStore();
  
  const categories = storeApps ? Array.from(new Set(storeApps.map(app => app.category))) : [];
  
  const filteredApps = storeApps ? 
    (selectedCategory === 'all' ? storeApps : storeApps.filter(app => app.category === selectedCategory)) : 
    [];
  
  const isAppInstalled = (app: StoreApp) => {
    return userApps?.some(userApp => userApp.id === app.id) || false;
  };
  
  const handleInstallApp = (app: StoreApp) => {
    installApp(app.id);
  };
  
  const handleUninstallApp = (app: StoreApp) => {
    const installedApp = userApps?.find(userApp => userApp.id === app.id);
    if (installedApp) {
      uninstallApp(installedApp.id);
    }
  };
  
  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };
  
  const renderAppGrid = (apps: StoreApp[]) => {
    if (apps.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold">No apps found</h3>
          <p className="text-muted-foreground">Try a different category or check back later</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {apps.map(app => (
          <div 
            key={app.id} 
            className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
            onClick={() => setSelectedApp(app)}
          >
            <div className="flex items-center mb-2">
              <img 
                src={app.icon} 
                alt={app.name} 
                className="w-12 h-12 mr-3 rounded"
              />
              <div>
                <h3 className="font-semibold">{app.name}</h3>
                <p className="text-xs text-muted-foreground">{app.publisher}</p>
              </div>
            </div>
            <p className="text-sm line-clamp-2 h-10 mb-2">{app.description}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i}
                      className="w-4 h-4"
                      fill={i <= 4 ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-xs ml-1">(24)</span>
              </div>
              <span className="text-xs">{app.price === 'Free' ? 'Free' : app.price}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderAppDetails = (app: StoreApp) => {
    const installed = isAppInstalled(app);
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-start p-4">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setSelectedApp(null)}
          >
            Back
          </Button>
          <img 
            src={app.icon}
            alt={app.name}
            className="w-16 h-16 rounded mr-4"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{app.name}</h2>
            <p className="text-sm text-muted-foreground">{app.publisher} • {app.category}</p>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i}
                  className="w-4 h-4"
                  fill={i <= 4 ? "currentColor" : "none"}
                />
              ))}
              <span className="text-xs ml-1">(24)</span>
            </div>
          </div>
          <div>
            {installed ? (
              <Button 
                variant="outline" 
                className="ml-auto"
                onClick={() => handleUninstallApp(app)}
                disabled={isUninstallingApp}
              >
                {isUninstallingApp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Installed
              </Button>
            ) : (
              <Button 
                className="ml-auto"
                onClick={() => handleInstallApp(app)}
                disabled={isInstallingApp}
              >
                {isInstallingApp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {app.price === 'Free' ? 'Install' : app.price}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex overflow-x-auto p-4 space-x-4">
          {app.screenshots.map((screenshot, index) => (
            <img 
              key={index}
              src={screenshot}
              alt={`${app.name} screenshot ${index + 1}`}
              className="w-64 h-auto rounded"
            />
          ))}
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm">{app.version}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-sm">{formatSize(app.size)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Content Rating</p>
              <p className="text-sm">{app.contentRating}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="text-sm">{new Date(app.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm">{app.description}</p>
        </div>
        
        <div className="p-4 mt-auto">
          <h3 className="font-semibold mb-2">Ratings & Reviews</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold">JD</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">John Doe</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star 
                        key={i}
                        className="w-3 h-3"
                        fill={i <= 5 ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm">This is an amazing app! I use it everyday and it has greatly improved my productivity.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    if (isLoadingStoreApps || isLoadingUserApps) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p>Loading apps...</p>
        </div>
      );
    }
    
    if (selectedApp) {
      return renderAppDetails(selectedApp);
    }
    
    return (
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList className="mb-0">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="installed">My Apps</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="discover" className="flex-1 flex">
            <div className="w-48 border-r p-4">
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="space-y-1">
                <p 
                  className={`text-sm cursor-pointer hover:text-primary ${selectedCategory === 'all' ? 'font-medium text-primary' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </p>
                {categories.map(category => (
                  <p 
                    key={category}
                    className={`text-sm cursor-pointer hover:text-primary ${selectedCategory === category ? 'font-medium text-primary' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {renderAppGrid(filteredApps)}
            </div>
          </TabsContent>
          
          <TabsContent value="installed" className="flex-1">
            {userApps && userApps.length > 0 ? (
              <div className="flex-1 overflow-auto">
                {renderAppGrid(userApps)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <h3 className="text-lg font-semibold">No installed apps</h3>
                <p className="text-muted-foreground mb-4">Discover and install apps from the store</p>
                <Button onClick={() => setActiveTab('discover')}>Browse Apps</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-2 flex items-center">
        <h2 className="text-lg font-semibold">App Store</h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default AppStore;