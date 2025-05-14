import React, { useState } from 'react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { DriveFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Search,
  Folder,
  FolderPlus,
  Upload,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileChartPie,
  FileArchive,
  Monitor,
  Download,
  RefreshCw,
  FolderOpen,
  HardDrive,
  MoreVertical,
} from 'lucide-react';

const FileExplorer: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: 'root', name: 'Google Drive' }]);
  const [fileUploadRef, setFileUploadRef] = useState<HTMLInputElement | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const {
    isAuthenticated,
    authenticate,
    files,
    folders,
    isLoadingFiles,
    isLoadingFolders,
    uploadFile,
    isUploading,
    createFolder,
    deleteFile,
    refetchFiles,
    refetchFolders,
  } = useGoogleDrive();

  const handleFolderClick = (folder: DriveFile) => {
    setCurrentFolder(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleBackClick = () => {
    if (folderPath.length > 1) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      setCurrentFolder(newPath[newPath.length - 1].id === 'root' ? null : newPath[newPath.length - 1].id);
    }
  };

  const handleUpClick = () => {
    if (folderPath.length > 1) {
      handleBackClick();
    }
  };

  const navigateToFolder = (pathIndex: number) => {
    if (pathIndex < folderPath.length - 1) {
      const newPath = folderPath.slice(0, pathIndex + 1);
      setFolderPath(newPath);
      setCurrentFolder(newPath[newPath.length - 1].id === 'root' ? null : newPath[newPath.length - 1].id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      uploadFile(
        { file, parentId: currentFolder || undefined },
        {
          onSuccess: () => {
            toast({
              title: 'File uploaded successfully',
              description: `${file.name} has been uploaded to Google Drive`,
            });
            if (fileUploadRef) {
              fileUploadRef.value = '';
            }
          },
          onError: (error) => {
            toast({
              title: 'Upload failed',
              description: error.message,
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Folder name is required',
        variant: 'destructive',
      });
      return;
    }

    createFolder(
      { name: newFolderName, parentId: currentFolder || undefined },
      {
        onSuccess: () => {
          toast({
            title: 'Folder created',
            description: `${newFolderName} has been created.`,
          });
          setNewFolderName('');
          setIsCreatingFolder(false);
        },
        onError: (error) => {
          toast({
            title: 'Failed to create folder',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleDeleteFile = (file: DriveFile) => {
    deleteFile(file.id, {
      onSuccess: () => {
        toast({
          title: 'File deleted',
          description: `${file.name} has been deleted.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to delete file',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const renderFileIcon = (file: DriveFile) => {
    if (file.mimeType.includes('folder')) {
      return <Folder className="text-win-blue text-2xl" />;
    } else if (file.mimeType.includes('image')) {
      return <FileImage className="text-purple-600 text-2xl" />;
    } else if (file.mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="text-green-600 text-2xl" />;
    } else if (file.mimeType.includes('document')) {
      return <FileText className="text-blue-600 text-2xl" />;
    } else if (file.mimeType.includes('presentation')) {
      return <FileChartPie className="text-orange-600 text-2xl" />;
    } else if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) {
      return <FileArchive className="text-yellow-600 text-2xl" />;
    } else if (file.mimeType.includes('javascript') || file.mimeType.includes('html') || file.mimeType.includes('css')) {
      return <FileCode className="text-purple-600 text-2xl" />;
    } else if (file.mimeType.includes('pdf')) {
      return <File className="text-red-600 text-2xl" />;
    } else {
      return <File className="text-gray-600 text-2xl" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
        <Folder className="h-16 w-16 text-win-blue mb-4" />
        <h2 className="text-xl font-bold mb-4">Connect to Cloud Storage</h2>
        <p className="text-gray-600 mb-4 text-center">
          Connect to view your files and folders.
        </p>
        {isLoadingFiles ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-win-blue mr-2"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <Button onClick={authenticate} className="bg-win-blue hover:bg-win-blue-dark">
            Connect to Storage
          </Button>
        )}
      </div>
    );
  }

  // Filter files based on current folder and search query
  const filteredFolders = folders
    ? folders.filter((folder) => {
        const parentMatch = folder.parents?.includes(currentFolder || 'root') || (!currentFolder && !folder.parents);
        const searchMatch = !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase());
        return parentMatch && searchMatch;
      })
    : [];

  const filteredFiles = files
    ? files.filter((file) => {
        const parentMatch = file.parents?.includes(currentFolder || 'root') || (!currentFolder && !file.parents);
        const searchMatch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return parentMatch && searchMatch;
      })
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="window-toolbar bg-win-bg-alt p-1 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="px-2 py-1 mx-1 rounded hover:bg-win-bg">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="px-2 py-1 mx-1 rounded hover:bg-win-bg">
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleUpClick} className="px-2 py-1 mx-1 rounded hover:bg-win-bg">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { refetchFiles(); refetchFolders(); }} className="px-2 py-1 mx-1 rounded hover:bg-win-bg">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <div className="flex-1 ml-2">
          <div className="flex items-center bg-white border rounded px-2 py-1">
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="mx-1 text-gray-400">/</span>}
                <button
                  onClick={() => navigateToFolder(index)}
                  className="hover:underline text-sm focus:outline-none"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="ml-2 relative">
          <div className="flex items-center border rounded px-2 py-1 bg-white">
            <Search className="h-4 w-4 text-gray-400 mr-1" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus:ring-0 p-0 text-sm h-6 bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)]">
        {/* Sidebar */}
        <div className="w-48 bg-win-bg border-r overflow-auto">
          <div className="p-2">
            <div className="flex items-center p-1 rounded hover:bg-win-bg-alt cursor-pointer">
              <Monitor className="text-win-blue-dark mr-2 h-4 w-4" />
              <span className="text-sm">This PC</span>
            </div>
            <div 
              className={`flex items-center p-1 rounded ${
                currentFolder === null ? 'bg-win-blue text-white' : 'hover:bg-win-bg-alt'
              } cursor-pointer`}
              onClick={() => {
                setCurrentFolder(null);
                setFolderPath([{ id: 'root', name: 'Google Drive' }]);
              }}
            >
              <FolderOpen className={`${currentFolder === null ? 'text-white' : 'text-win-blue-dark'} mr-2 h-4 w-4`} />
              <span className="text-sm">Google Drive</span>
            </div>
            <div className="flex items-center p-1 rounded hover:bg-win-bg-alt cursor-pointer">
              <Download className="text-win-blue-dark mr-2 h-4 w-4" />
              <span className="text-sm">Downloads</span>
            </div>
            <div className="flex items-center p-1 rounded hover:bg-win-bg-alt cursor-pointer">
              <FileText className="text-win-blue-dark mr-2 h-4 w-4" />
              <span className="text-sm">Documents</span>
            </div>
            <div className="flex items-center p-1 rounded hover:bg-win-bg-alt cursor-pointer">
              <FileImage className="text-win-blue-dark mr-2 h-4 w-4" />
              <span className="text-sm">Pictures</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            {/* Quick Actions */}
            <div className="mb-4 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center space-x-1"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                <span>New Folder</span>
              </Button>
              
              <input
                ref={(ref) => setFileUploadRef(ref)}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileUploadRef?.click()}
                className="flex items-center space-x-1"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
              </Button>
            </div>

            {/* New Folder Input */}
            {isCreatingFolder && (
              <div className="mb-4 flex items-center space-x-2">
                <Input 
                  type="text" 
                  placeholder="New Folder Name" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-48"
                />
                <Button size="sm" onClick={handleCreateFolder}>Create</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
              </div>
            )}

            {/* Files and Folders */}
            {isLoadingFiles || isLoadingFolders ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-win-blue"></div>
                <p className="mt-2 text-gray-600">Loading files...</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {/* Folders first */}
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="p-2 rounded hover:bg-win-bg-alt cursor-pointer flex flex-col items-center text-center"
                    onDoubleClick={() => handleFolderClick(folder)}
                  >
                    <Folder className="text-win-blue text-2xl mb-1" />
                    <span className="text-xs truncate w-full">{folder.name}</span>
                  </div>
                ))}

                {/* Then files */}
                {filteredFiles.map((file) => (
                  <Tooltip key={file.id} content={
                    <div className="text-xs">
                      <div><strong>Name:</strong> {file.name}</div>
                      <div><strong>Type:</strong> {file.mimeType.split('/')[1]}</div>
                      <div><strong>Modified:</strong> {new Date(file.modifiedTime).toLocaleString()}</div>
                      {file.size && <div><strong>Size:</strong> {Math.round(parseInt(file.size)/1024)} KB</div>}
                    </div>
                  }>
                    <div
                      className="p-2 rounded hover:bg-win-bg-alt cursor-pointer flex flex-col items-center text-center relative group"
                      onDoubleClick={() => {
                        // For demo, show preview in a new browser window
                        toast({
                          title: `Opening ${file.name}`,
                          description: "File would open in the appropriate application in a full implementation"
                        });
                      }}
                    >
                      {renderFileIcon(file)}
                      <span className="text-xs truncate w-full mt-1">{file.name}</span>
                      <div 
                        className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100"
                      >
                        <div className="relative">
                          <button 
                            className="hover:bg-gray-200 rounded p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                ))}

                {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                  <div className="col-span-4 text-center py-10 text-gray-500">
                    <HardDrive className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>This folder is empty</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t bg-win-bg-alt p-1 text-xs flex items-center">
        <span>{filteredFolders.length + filteredFiles.length} items</span>
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default FileExplorer;
