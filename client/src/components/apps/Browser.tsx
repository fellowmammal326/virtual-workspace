import React, { useState, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrowserTab } from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  X,
  Lock,
  Bookmark,
} from 'lucide-react';

const Browser: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'Google', url: 'https://www.google.com', isActive: true },
    { id: 'tab-2', title: 'New Tab', url: 'about:blank', isActive: false },
  ]);
  
  const [currentUrl, setCurrentUrl] = useState<string>('https://www.google.com');
  const [loading, setLoading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleTabClick = (id: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === id,
      }))
    );
    
    const activeTab = tabs.find(tab => tab.id === id);
    if (activeTab) {
      setCurrentUrl(activeTab.url);
    }
  };

  const handleTabClose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't close if it's the last tab
    if (tabs.length <= 1) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === id);
    const isActiveTab = tabs[tabIndex].isActive;
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== id);
      
      // If we closed the active tab, activate another one
      if (isActiveTab && newTabs.length > 0) {
        // Try to activate the tab to the right, or if there isn't one, the tab to the left
        const newActiveIndex = tabIndex < newTabs.length ? tabIndex : tabIndex - 1;
        return newTabs.map((tab, i) => ({
          ...tab,
          isActive: i === newActiveIndex,
        }));
      }
      
      return newTabs;
    });
    
    // Update current URL if needed
    if (isActiveTab) {
      const newTabs = tabs.filter(tab => tab.id !== id);
      const newActiveIndex = tabIndex < newTabs.length ? tabIndex : tabIndex - 1;
      setCurrentUrl(newTabs[newActiveIndex].url);
    }
  };

  const addNewTab = () => {
    const newTabId = `tab-${nanoid(6)}`;
    
    setTabs(prevTabs => [
      ...prevTabs.map(tab => ({ ...tab, isActive: false })),
      { id: newTabId, title: 'New Tab', url: 'about:blank', isActive: true },
    ]);
    
    setCurrentUrl('about:blank');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(e.target.value);
  };

  const getUrlWithProtocol = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://') || url === 'about:blank') {
      return url;
    }
    // Check if it's a search or a URL
    if (url.includes('.') && !url.includes(' ')) {
      return `https://${url}`;
    }
    // Treat as a search
    return `https://www.google.com/search?q=${encodeURIComponent(url)}`;
  };

  const loadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const processedUrl = getUrlWithProtocol(currentUrl);
    setLoading(true);
    
    // Update the active tab with the new URL
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.isActive 
          ? { ...tab, url: processedUrl } 
          : tab
      )
    );
    
    setCurrentUrl(processedUrl);
    
    // In a real implementation, we'd wait for the iframe to load
    setTimeout(() => {
      setLoading(false);
      
      // Update tab title based on URL
      let title = new URL(processedUrl).hostname;
      if (title.startsWith('www.')) {
        title = title.substring(4);
      }
      
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.isActive 
            ? { ...tab, title } 
            : tab
        )
      );
    }, 1000);
  };

  const goBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const goForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const goHome = () => {
    const homeUrl = 'https://www.google.com';
    setLoading(true);
    setCurrentUrl(homeUrl);
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.isActive 
          ? { ...tab, url: homeUrl, title: 'Google' } 
          : tab
      )
    );
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getActiveTabUrl = (): string => {
    const activeTab = tabs.find(tab => tab.isActive);
    return activeTab ? activeTab.url : 'about:blank';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b bg-win-bg-alt">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`browser-tab flex items-center px-3 py-2 cursor-pointer ${tab.isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="mr-2 text-sm truncate max-w-[100px]">{tab.title}</span>
            <button 
              className="text-xs opacity-50 hover:opacity-100 focus:outline-none"
              onClick={(e) => handleTabClose(tab.id, e)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button 
          className="px-2 py-2 hover:bg-win-bg-alt focus:outline-none"
          onClick={addNewTab}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-2 bg-win-bg border-b flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack}
          className="p-1 mx-1 rounded hover:bg-win-bg-alt focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goForward}
          className="p-1 mx-1 rounded hover:bg-win-bg-alt focus:outline-none"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={refresh}
          className="p-1 mx-1 rounded hover:bg-win-bg-alt focus:outline-none"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goHome}
          className="p-1 mx-1 rounded hover:bg-win-bg-alt focus:outline-none"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 ml-2">
          <form onSubmit={loadUrl}>
            <div className="flex items-center bg-white border rounded px-2 py-1">
              <Lock className="text-green-600 mr-2 text-xs h-3 w-3" />
              <Input 
                type="text" 
                className="border-0 flex-1 focus:ring-0 p-0 text-sm h-6 bg-transparent"
                value={currentUrl}
                onChange={handleUrlChange}
              />
            </div>
          </form>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="p-1 mx-1 rounded hover:bg-win-bg-alt focus:outline-none"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="browser-content flex-1 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-win-blue"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={getActiveTabUrl()}
            className="w-full h-full border-none"
            title="Browser Content"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

export default Browser;
