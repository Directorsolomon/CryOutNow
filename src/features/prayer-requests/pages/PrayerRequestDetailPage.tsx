/**
 * @file PrayerRequestDetailPage.tsx
 * @description Detailed view page for individual prayer requests
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  usePrayerRequest,
  useDeletePrayerRequest 
} from '../hooks/usePrayerRequests';
import { PrayerRequestForm } from '../components/PrayerRequestForm';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

/**
 * PrayerRequestDetailPage Component
 * @component
 * @description Displays detailed information about a specific prayer request
 */
export function PrayerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: prayerRequest, isLoading, error } = usePrayerRequest(id!);
  const deleteRequest = useDeletePrayerRequest();

  if (isLoading) {
    return <LoadingSpinner text="Loading prayer request..." />;
  }

  if (error || !prayerRequest) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="text-red-500 mb-4">
          Error loading prayer request
        </div>
        <Button onClick={() => navigate('/prayer-requests')}>
          Back to Prayer Requests
        </Button>
      </div>
    );
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteRequest.mutateAsync(prayerRequest.id);
      navigate('/prayer-requests');
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isOwner = user?.uid === prayerRequest.userId;
  const createdAt = new Date(prayerRequest.createdAt);
  const updatedAt = new Date(prayerRequest.updatedAt);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{prayerRequest.title}</h1>
            <div className="flex gap-2 items-center text-gray-500 text-sm">
              <span>Created {formatDistanceToNow(createdAt)} ago</span>
              {createdAt.getTime() !== updatedAt.getTime() && (
                <span>• Updated {formatDistanceToNow(updatedAt)} ago</span>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <PrayerRequestForm
                    prayerRequest={prayerRequest}
                    onSuccess={handleEditSuccess}
                  />
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Prayer Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this prayer request? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <Badge variant={prayerRequest.isPrivate ? 'secondary' : 'default'}>
              {prayerRequest.isPrivate ? 'Private' : 'Public'}
            </Badge>
            <Badge variant="outline">{prayerRequest.status}</Badge>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap mb-6">
            {prayerRequest.description}
          </p>

          {prayerRequest.tags && prayerRequest.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prayerRequest.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {prayerRequest.scriptureReferences && prayerRequest.scriptureReferences.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Scripture References
              </h3>
              <div className="flex flex-wrap gap-2">
                {prayerRequest.scriptureReferences.map(reference => (
                  <Badge key={reference} variant="outline">{reference}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/prayer-requests')}
          >
            Back to Prayer Requests
          </Button>
          <div className="text-gray-500">
            {prayerRequest.prayerCount} {prayerRequest.prayerCount === 1 ? 'prayer' : 'prayers'}
          </div>
        </div>
      </div>
    </div>
  );
} 