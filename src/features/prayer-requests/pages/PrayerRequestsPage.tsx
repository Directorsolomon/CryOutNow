/**
 * @file PrayerRequestsPage.tsx
 * @description Page component for displaying and managing prayer requests
 */

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  usePublicPrayerRequests,
  useUserPrayerRequests 
} from '../hooks/usePrayerRequests';
import { PrayerRequestStatus } from '../types';
import { PrayerRequestCard } from '../components/PrayerRequestCard';
import { PrayerRequestForm } from '../components/PrayerRequestForm';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

/**
 * PrayerRequestsPage Component
 * @component
 * @description Main page for viewing and managing prayer requests
 */
export function PrayerRequestsPage() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PrayerRequestStatus>(
    PrayerRequestStatus.ACTIVE
  );
  const [selectedTab, setSelectedTab] = useState('public');

  const publicRequests = usePublicPrayerRequests(selectedStatus);
  const userRequests = useUserPrayerRequests(selectedStatus);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prayer Requests</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Prayer Request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <PrayerRequestForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as PrayerRequestStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PrayerRequestStatus).map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="public">Public Requests</TabsTrigger>
          {user && <TabsTrigger value="my">My Requests</TabsTrigger>}
        </TabsList>

        <TabsContent value="public">
          {publicRequests.isLoading ? (
            <Loading text="Loading prayer requests..." />
          ) : publicRequests.error ? (
            <div className="text-center text-red-500">
              Error loading prayer requests
            </div>
          ) : publicRequests.data?.length === 0 ? (
            <div className="text-center text-gray-500">
              No prayer requests found
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicRequests.data?.map(request => (
                <PrayerRequestCard
                  key={request.id}
                  prayerRequest={request}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          {!user ? (
            <div className="text-center text-gray-500">
              Please sign in to view your prayer requests
            </div>
          ) : userRequests.isLoading ? (
            <Loading text="Loading your prayer requests..." />
          ) : userRequests.error ? (
            <div className="text-center text-red-500">
              Error loading your prayer requests
            </div>
          ) : userRequests.data?.length === 0 ? (
            <div className="text-center text-gray-500">
              You haven't created any prayer requests yet
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userRequests.data?.map(request => (
                <PrayerRequestCard
                  key={request.id}
                  prayerRequest={request}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 