import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { PrayerRequest } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { toggleLike } from "../../services/firebase";
import { useState, lazy, Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { LoadingSpinner } from "../ui/loading";

// Lazy load Comments component
const Comments = lazy(() => import("./Comments").then(mod => ({ default: mod.Comments })));

interface PrayerRequestCardProps {
  request: PrayerRequest;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PrayerRequestCard({ request, onEdit, onDelete }: PrayerRequestCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(request.userLikes?.includes(user?.uid || "") || false);
  const [likeCount, setLikeCount] = useState(request.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    try {
      await toggleLike(request.id!);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: request.title,
        text: request.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const isOwner = user?.uid === request.userId;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">
            {request.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(request.createdAt, { addSuffix: true })}
          </p>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={onDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{request.description}</p>
        <div className="flex flex-wrap gap-2">
          {request.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={isLiked ? "text-primary" : ""}
              onClick={handleLike}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Comments
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
        </div>

        {showComments && (
          <div className="w-full pt-4 border-t">
            <Suspense fallback={<LoadingSpinner />}>
              <Comments requestId={request.id!} />
            </Suspense>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 
