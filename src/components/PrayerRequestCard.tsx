import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrayerRequestCardProps {
  author: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
}

export function PrayerRequestCard({
  author,
  date,
  title,
  content,
  tags,
  likes,
  comments,
}: PrayerRequestCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="font-medium">{author}</span>
          <div className="flex items-center text-muted-foreground text-sm">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {date}
          </div>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4 text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{comments}</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 