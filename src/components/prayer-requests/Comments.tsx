import { useState, useEffect } from "react";
import { Comment, getComments, addComment } from "../../services/firebase";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface CommentsProps {
  requestId: string;
}

export function Comments({ requestId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [requestId]);

  const loadComments = async () => {
    try {
      const fetchedComments = await getComments(requestId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load comments. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await addComment(requestId, newComment.trim());
      await loadComments(); // Reload comments to get the new one
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <p className="text-sm">{comment.text}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
