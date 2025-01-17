import { useState, lazy, Suspense } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LoadingSpinner } from "../ui/loading";
import { toggleLike, PrayerRequest } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

const Comments = lazy(() => import("./Comments"));

interface PrayerRequestCardProps {
  request: PrayerRequest;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PrayerRequestCard({ request, onEdit, onDelete }: PrayerRequestCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(request.userLikes?.includes(user?.uid || "") || false);
  const [likeCount, setLikeCount] = useState(request.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  const handleCommentClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!handleInteraction('comment')) return;
    setShowComments(!showComments);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInteraction = (action: 'like' | 'comment' | 'share') => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: `Please sign in to ${action} prayer requests`,
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        ),
      });
      return false;
    }
    return true;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!handleInteraction('like')) return;

    setIsSubmitting(true);
    try {
      if (!request.id) throw new Error('Request ID is required');
      await toggleLike(request.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      toast({
        title: isLiked ? "Like Removed" : "Prayer Request Liked",
        description: isLiked ? "You've removed your like" : "Thank you for your support",
      });
    } catch (error) {
      console.error('Like error:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!handleInteraction('share')) return;
    try {
      await navigator.share({
        title: request.title,
        text: request.description,
        url: window.location.href,
      });
      toast({
        title: "Shared Successfully",
        description: "Prayer request has been shared",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share prayer request",
        variant: "destructive",
      });
    }
  };

  const isOwner = user?.uid === request.userId;

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">
            {request.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
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
          {request.tags?.map((tag) => (
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              )}
              {likeCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCommentClick}
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