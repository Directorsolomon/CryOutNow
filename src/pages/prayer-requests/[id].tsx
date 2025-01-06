import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Heart, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export default function PrayerRequestPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "John Doe",
      content: "Praying for you and your family. Stay strong in faith.",
      date: "January 24, 2024"
    }
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: user?.email || "Anonymous",
      content: newComment,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Sarah Johnson</span>
            <div className="flex items-center text-muted-foreground text-sm">
              <CalendarIcon className="w-4 h-4 mr-1" />
              January 23, 2024
            </div>
          </div>
          <h1 className="text-2xl font-semibold">Prayer for Health and Recovery</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Please pray for my mother who is currently in the hospital recovering from surgery. 
            She's been struggling with pain but staying strong in faith.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Health</Badge>
            <Badge variant="secondary">Family</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">24</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{comments.length}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Comments</h2>
        
        {user ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment}>Add Comment</Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Please log in to comment.</p>
        )}

        <div className="space-y-4 mt-6">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="py-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{comment.author}</span>
                  <span className="text-sm text-muted-foreground">{comment.date}</span>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-muted-foreground">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 