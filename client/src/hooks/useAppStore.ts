import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StoreApp } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

export function useAppStore() {
  const queryClient = useQueryClient();

  // Fetch all apps in the store
  const { data: storeApps, isLoading: isLoadingStoreApps, error: storeAppsError } = useQuery({
    queryKey: ['/api/store/apps'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/store/apps');
      const data = await response.json();
      return data as StoreApp[];
    }
  });

  // Fetch user's installed apps
  const { data: userApps, isLoading: isLoadingUserApps, error: userAppsError } = useQuery({
    queryKey: ['/api/user/apps'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/apps');
      const data = await response.json();
      return data as StoreApp[];
    }
  });

  // Fetch a single app's details
  const getAppDetails = (appId: number) => {
    return useQuery({
      queryKey: ['/api/store/apps', appId],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/store/apps/${appId}`);
        const data = await response.json();
        return data as StoreApp;
      }
    });
  };

  // Fetch app reviews
  const getAppReviews = (appId: number) => {
    return useQuery({
      queryKey: ['/api/apps', appId, 'reviews'],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/apps/${appId}/reviews`);
        const data = await response.json();
        return data;
      }
    });
  };

  // Install an app
  const installAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const response = await apiRequest('POST', '/api/user/apps', { appId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/apps'] });
    }
  });

  // Uninstall an app
  const uninstallAppMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/user/apps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/apps'] });
    }
  });

  // Submit a review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ appId, rating, review }: { appId: number, rating: number, review: string }) => {
      const response = await apiRequest('POST', `/api/apps/${appId}/reviews`, { rating, review });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/apps', variables.appId, 'reviews'] });
    }
  });

  return {
    storeApps,
    isLoadingStoreApps,
    storeAppsError,
    userApps,
    isLoadingUserApps,
    userAppsError,
    getAppDetails,
    getAppReviews,
    installApp: installAppMutation.mutate,
    isInstallingApp: installAppMutation.isPending,
    uninstallApp: uninstallAppMutation.mutate,
    isUninstallingApp: uninstallAppMutation.isPending,
    submitReview: submitReviewMutation.mutate,
    isSubmittingReview: submitReviewMutation.isPending,
  };
}