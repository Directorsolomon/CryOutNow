/**
 * @file PrayerRequestCard.tsx
 * @description Card component for displaying a prayer request
 */

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useRecordPrayer, useRemovePrayer } from '../hooks/usePrayerRequests';
import { PrayerRequest, PrayerRequestStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PrayerRequestCardProps {
  request: PrayerRequest;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusIcons = {
  [PrayerRequestStatus.ACTIVE]: null,
  [PrayerRequestStatus.ANSWERED]: <CheckCircle2 className="h-4 w-4" />,
  [PrayerRequestStatus.ARCHIVED]: <Archive className="h-4 w-4" />,
};

const statusColors = {
  [PrayerRequestStatus.ACTIVE]: 'default',
  [PrayerRequestStatus.ANSWERED]: 'success',
  [PrayerRequestStatus.ARCHIVED]: 'secondary',
} as const;

/**
 * PrayerRequestCard Component
 * @component
 * @description Displays a prayer request in a card format with interactive elements
 */
export function PrayerRequestCard({ request, onEdit, onDelete }: PrayerRequestCardProps) {
  const { user } = useAuth();
  const recordPrayer = useRecordPrayer();
  const removePrayer = useRemovePrayer();
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwner = user?.uid === request.userId;
  const hasPrayed = request.prayingUsers.includes(user?.uid || '');
  const timeAgo = formatDistanceToNow(request.createdAt, { addSuffix: true });

  const handlePrayerToggle = () => {
    if (hasPrayed) {
      removePrayer.mutate(request.id);
    } else {
      recordPrayer.mutate(request.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{request.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{timeAgo}</span>
              {request.isPrivate ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </div>
          </div>
          <Badge variant={statusColors[request.status]}>
            <div className="flex items-center gap-1">
              {statusIcons[request.status]}
              {request.status}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className={isExpanded ? '' : 'line-clamp-3'}>
          {request.description}
        </p>
        {request.description.length > 150 && (
          <Button
            variant="link"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0 h-auto font-normal"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        )}

        {request.tags && request.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {request.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={hasPrayed ? 'default' : 'outline'}
            size="sm"
            onClick={handlePrayerToggle}
            disabled={recordPrayer.isPending || removePrayer.isPending}
          >
            <Heart 
              className={`h-4 w-4 mr-1 ${hasPrayed ? 'fill-current' : ''}`} 
            />
            {request.prayerCount} {request.prayerCount === 1 ? 'Prayer' : 'Prayers'}
          </Button>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 