import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrayerRequestCard } from "@/components/PrayerRequestCard";
import { Plus } from "lucide-react";

const sampleRequests = [
  {
    id: "1",
    author: "Sarah Johnson",
    date: "January 23, 2024",
    title: "Prayer for Health and Recovery",
    content: "Please pray for my mother who is currently in the hospital recovering from surgery. She's been struggling with pain but staying strong in faith.",
    tags: ["Health", "Family"],
    likes: 24,
    comments: 1
  },
  {
    id: "2",
    author: "Michael Chen",
    date: "January 22, 2024",
    title: "Guidance for Career Decision",
    content: "I'm at a crossroads in my career and need wisdom for an important decision. Please pray for God's clear direction in this matter.",
    tags: ["Career", "Guidance"],
    likes: 15,
    comments: 1
  },
  {
    id: "3",
    author: "David Wilson",
    date: "January 21, 2024",
    title: "Prayer for Marriage Restoration",
    content: "Requesting prayers for my marriage. Going through a difficult time and seeking God's intervention for healing and reconciliation.",
    tags: ["Marriage", "Relationships"],
    likes: 42,
    comments: 1
  }
];

export default function PrayerRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const filteredRequests = sampleRequests.filter(request => 
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return b.likes - a.likes;
      case "comments":
        return b.comments - a.comments;
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default: // recent
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Prayer Requests</h1>
        <Button asChild>
          <Link to="/prayer-requests/create">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search prayer requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="comments">Most Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {sortedRequests.map((request) => (
          <Link key={request.id} to={`/prayer-requests/${request.id}`}>
            <PrayerRequestCard {...request} />
          </Link>
        ))}
        {sortedRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No prayer requests found.
          </div>
        )}
      </div>
    </div>
  );
} 