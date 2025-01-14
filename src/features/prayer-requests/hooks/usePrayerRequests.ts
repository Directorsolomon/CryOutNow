/**
 * @file usePrayerRequests.ts
 * @description React Query hooks for managing prayer requests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  PrayerRequest,
  PrayerRequestStatus,
  CreatePrayerRequestData,
  UpdatePrayerRequestData,
} from '../types';
import {
  createPrayerRequest,
  getPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
  getUserPrayerRequests,
  getPublicPrayerRequests,
  recordPrayer,
  removePrayer,
} from '../services/prayer-requests';

// Query keys
const KEYS = {
  all: ['prayerRequests'] as const,
  lists: () => [...KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...KEYS.lists(), filters] as const,
  details: () => [...KEYS.all, 'detail'] as const,
  detail: (id: string) => [...KEYS.details(), id] as const,
};

/**
 * Hook for fetching a single prayer request
 */
export function usePrayerRequest(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getPrayerRequest(id),
    enabled: !!id,
  });
}

/**
 * Hook for fetching user's prayer requests
 */
export function useUserPrayerRequests(status?: PrayerRequestStatus) {
  const { user } = useAuth();

  return useQuery({
    queryKey: KEYS.list({ type: 'user', userId: user?.uid, status }),
    queryFn: () => getUserPrayerRequests(user!.uid, status),
    enabled: !!user,
  });
}

/**
 * Hook for fetching public prayer requests
 */
export function usePublicPrayerRequests(status?: PrayerRequestStatus) {
  return useQuery({
    queryKey: KEYS.list({ type: 'public', status }),
    queryFn: () => getPublicPrayerRequests(status),
  });
}

/**
 * Hook for creating a prayer request
 */
export function useCreatePrayerRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreatePrayerRequestData) => createPrayerRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.lists() });
      toast({
        title: 'Prayer Request Created',
        description: 'Your prayer request has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for updating a prayer request
 */
export function useUpdatePrayerRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePrayerRequestData }) =>
      updatePrayerRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: KEYS.lists() });
      toast({
        title: 'Prayer Request Updated',
        description: 'Your prayer request has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for deleting a prayer request
 */
export function useDeletePrayerRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deletePrayerRequest,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KEYS.lists() });
      queryClient.removeQueries({ queryKey: KEYS.detail(id) });
      toast({
        title: 'Prayer Request Deleted',
        description: 'The prayer request has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for recording a prayer
 */
export function useRecordPrayer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (requestId: string) => recordPrayer(requestId, user!.uid),
    onMutate: async (requestId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: KEYS.detail(requestId) });

      // Get current prayer request
      const previousRequest = queryClient.getQueryData<PrayerRequest>(KEYS.detail(requestId));

      // Optimistically update the prayer request
      if (previousRequest) {
        queryClient.setQueryData<PrayerRequest>(KEYS.detail(requestId), {
          ...previousRequest,
          prayerCount: previousRequest.prayerCount + 1,
          prayingUsers: [...previousRequest.prayingUsers, user!.uid],
        });
      }

      return { previousRequest };
    },
    onError: (error, requestId, context) => {
      // Revert on error
      if (context?.previousRequest) {
        queryClient.setQueryData(KEYS.detail(requestId), context.previousRequest);
      }
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(requestId) });
      toast({
        title: 'Prayer Recorded',
        description: 'Thank you for praying!',
      });
    },
  });
}

/**
 * Hook for removing a prayer
 */
export function useRemovePrayer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (requestId: string) => removePrayer(requestId, user!.uid),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: KEYS.detail(requestId) });

      const previousRequest = queryClient.getQueryData<PrayerRequest>(KEYS.detail(requestId));

      if (previousRequest) {
        queryClient.setQueryData<PrayerRequest>(KEYS.detail(requestId), {
          ...previousRequest,
          prayerCount: previousRequest.prayerCount - 1,
          prayingUsers: previousRequest.prayingUsers.filter(id => id !== user!.uid),
        });
      }

      return { previousRequest };
    },
    onError: (error, requestId, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(KEYS.detail(requestId), context.previousRequest);
      }
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(requestId) });
      toast({
        title: 'Prayer Removed',
        description: 'Your prayer has been removed.',
      });
    },
  });
} 