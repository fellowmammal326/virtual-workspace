import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DriveFile } from '@/lib/types';

interface UseDriveOptions {
  enabled?: boolean;
}

// Demo data for development
const demoFolders: DriveFile[] = [
  {
    id: 'folder1',
    name: 'Documents',
    mimeType: 'application/vnd.google-apps.folder',
    iconLink: '',
    webViewLink: '#',
    parents: ['root'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString()
  },
  {
    id: 'folder2',
    name: 'Images',
    mimeType: 'application/vnd.google-apps.folder',
    iconLink: '',
    webViewLink: '#',
    parents: ['root'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString()
  },
  {
    id: 'folder3',
    name: 'Projects',
    mimeType: 'application/vnd.google-apps.folder',
    iconLink: '',
    webViewLink: '#',
    parents: ['root'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString()
  },
  {
    id: 'subfolder1',
    name: 'Work Documents',
    mimeType: 'application/vnd.google-apps.folder',
    iconLink: '',
    webViewLink: '#',
    parents: ['folder1'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString()
  }
];

const demoFiles: DriveFile[] = [
  {
    id: 'file1',
    name: 'Resume.pdf',
    mimeType: 'application/pdf',
    iconLink: '',
    webViewLink: '#',
    parents: ['folder1'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    size: '1048576' // 1MB
  },
  {
    id: 'file2',
    name: 'Profile Picture.jpg',
    mimeType: 'image/jpeg',
    iconLink: '',
    webViewLink: '#',
    thumbnailLink: '',
    parents: ['folder2'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    size: '512000' // 500KB
  },
  {
    id: 'file3',
    name: 'Project Plan.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    iconLink: '',
    webViewLink: '#',
    parents: ['folder3'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    size: '819200' // 800KB
  },
  {
    id: 'file4',
    name: 'Budget.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    iconLink: '',
    webViewLink: '#',
    parents: ['root'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    size: '102400' // 100KB
  },
  {
    id: 'file5',
    name: 'Notes.txt',
    mimeType: 'text/plain',
    iconLink: '',
    webViewLink: '#',
    parents: ['root'],
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    size: '10240' // 10KB
  }
];

export function useGoogleDrive(options: UseDriveOptions = {}) {
  // For development, we'll use simulated data instead of Google API calls
  // In production, we'll use the real Google API
  // Using Vite's import.meta.env instead of process.env
  const USE_MOCK = import.meta.env.DEV === true;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mockFiles, setMockFiles] = useState<DriveFile[]>([...demoFiles]);
  const [mockFolders, setMockFolders] = useState<DriveFile[]>([...demoFolders]);
  const [isLoading, setIsLoading] = useState(false);
  const { enabled = true } = options;

  // Authentication check - both mock and real implementation
  useEffect(() => {
    if (USE_MOCK) {
      // Check if already authenticated in mock session
      const isAuth = sessionStorage.getItem('mockGoogleAuth') === 'authenticated';
      setIsAuthenticated(isAuth);
    } else {
      // Check real authentication status with API
      fetch('/api/google/auth/status')
        .then(res => res.json())
        .then(data => {
          if (data && 'authenticated' in data) {
            setIsAuthenticated(data.authenticated);
          }
        })
        .catch(err => console.error('Error checking auth status:', err));
    }
  }, [USE_MOCK]);

  // Authentication method - both mock and real implementation
  const authenticate = () => {
    if (USE_MOCK) {
      // Simulate oauth process with a timeout
      setIsLoading(true);
      setTimeout(() => {
        sessionStorage.setItem('mockGoogleAuth', 'authenticated');
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 1000);
    } else {
      // Get auth URL and redirect for real OAuth
      fetch('/api/google/auth/url')
        .then(res => res.json())
        .then(data => {
          if (data && data.url) {
            window.location.href = data.url;
          }
        })
        .catch(err => console.error('Error getting auth URL:', err));
    }
  };

  // Simulate file upload
  const uploadFile = ({ file, parentId }: { file: File, parentId?: string }, options?: any) => {
    setIsLoading(true);
    
    // Create a fake file reader to simulate reading the file
    setTimeout(() => {
      try {
        const newFile: DriveFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          iconLink: '',
          webViewLink: '#',
          parents: [parentId || 'root'],
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          size: file.size.toString()
        };
        
        setMockFiles(prev => [...prev, newFile]);
        setIsLoading(false);
        options?.onSuccess?.();
      } catch (error) {
        console.error("Error uploading file:", error);
        setIsLoading(false);
        options?.onError?.(new Error("Failed to upload file"));
      }
    }, 1000);
  };

  // Simulate folder creation
  const createFolder = ({ name, parentId }: { name: string, parentId?: string }, options?: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const newFolder: DriveFile = {
        id: `folder-${Date.now()}`,
        name,
        mimeType: 'application/vnd.google-apps.folder',
        iconLink: '',
        webViewLink: '#',
        parents: [parentId || 'root'],
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString()
      };
      
      setMockFolders(prev => [...prev, newFolder]);
      setIsLoading(false);
      options?.onSuccess?.();
    }, 1000);
  };

  // Simulate file deletion
  const deleteFile = (fileId: string, options?: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setMockFiles(prev => prev.filter(file => file.id !== fileId));
      setMockFolders(prev => prev.filter(folder => folder.id !== fileId));
      setIsLoading(false);
      options?.onSuccess?.();
    }, 800);
  };

  const refetchFiles = () => {
    // Simulated refetch
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const refetchFolders = () => {
    // Simulated refetch
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const getFile = (fileId: string) => {
    // This is a simplified mock - in real implementation this would use useQuery
    const file = mockFiles.find(f => f.id === fileId);
    return {
      data: file,
      isLoading: false,
      error: null
    };
  };

  // If using the real API, set up the actual API queries
  const {
    data: realFiles,
    isLoading: realLoadingFiles,
    error: realFilesError,
    refetch: realRefetchFiles
  } = useQuery<DriveFile[]>({
    queryKey: ['/api/google/files'],
    enabled: !USE_MOCK && isAuthenticated && enabled,
  });

  const {
    data: realFolders,
    isLoading: realLoadingFolders,
    error: realFoldersError,
    refetch: realRefetchFolders
  } = useQuery<DriveFile[]>({
    queryKey: ['/api/google/folders'],
    enabled: !USE_MOCK && isAuthenticated && enabled,
  });

  // Real implementation of file upload
  const realUploadFileMutation = useMutation({
    mutationFn: async ({ file, parentId }: { file: File, parentId?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (parentId) {
        formData.append('parentId', parentId);
      }
      
      const response = await fetch('/api/google/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      realRefetchFiles();
      realRefetchFolders();
    },
  });

  // Real implementation of folder creation
  const realCreateFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }: { name: string, parentId?: string }) => {
      const response = await apiRequest('POST', '/api/google/folders', { name, parentId });
      return await response.json();
    },
    onSuccess: () => {
      realRefetchFolders();
    },
  });

  // Real implementation of file deletion
  const realDeleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest('DELETE', `/api/google/files/${fileId}`);
      return await response.json();
    },
    onSuccess: () => {
      realRefetchFiles();
      realRefetchFolders();
    },
  });

  return {
    isAuthenticated,
    authenticate,
    // Return either mock or real data depending on environment
    files: USE_MOCK ? mockFiles : (realFiles || []),
    folders: USE_MOCK ? mockFolders : (realFolders || []),
    isLoadingFiles: USE_MOCK ? isLoading : realLoadingFiles,
    isLoadingFolders: USE_MOCK ? isLoading : realLoadingFolders,
    filesError: USE_MOCK ? null : realFilesError,
    foldersError: USE_MOCK ? null : realFoldersError,
    getFile,
    // Use either mock or real implementations
    uploadFile: USE_MOCK ? uploadFile : realUploadFileMutation.mutate,
    isUploading: USE_MOCK ? isLoading : realUploadFileMutation.isPending,
    createFolder: USE_MOCK ? createFolder : realCreateFolderMutation.mutate,
    isCreatingFolder: USE_MOCK ? isLoading : realCreateFolderMutation.isPending,
    deleteFile: USE_MOCK ? deleteFile : realDeleteFileMutation.mutate,
    isDeleting: USE_MOCK ? isLoading : realDeleteFileMutation.isPending,
    refetchFiles: USE_MOCK ? refetchFiles : realRefetchFiles,
    refetchFolders: USE_MOCK ? refetchFolders : realRefetchFolders,
  };
}
