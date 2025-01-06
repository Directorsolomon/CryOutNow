import { PrayerRequestCard } from "./PrayerRequestCard";

const sampleRequests = [
  {
    author: "Sarah Johnson",
    date: "January 23, 2024",
    title: "Prayer for Health and Recovery",
    content: "Please pray for my mother who is currently in the hospital recovering from surgery. She's been struggling with pain but staying strong in faith.",
    tags: ["Health", "Family"],
    likes: 24,
    comments: 1
  },
  {
    author: "Michael Chen",
    date: "January 22, 2024",
    title: "Guidance for Career Decision",
    content: "I'm at a crossroads in my career and need wisdom for an important decision. Please pray for God's clear direction in this matter.",
    tags: ["Career", "Guidance"],
    likes: 15,
    comments: 1
  },
  {
    author: "David Wilson",
    date: "January 21, 2024",
    title: "Prayer for Marriage Restoration",
    content: "Requesting prayers for my marriage. Going through a difficult time and seeking God's intervention for healing and reconciliation.",
    tags: ["Marriage", "Relationships"],
    likes: 42,
    comments: 1
  }
];

export function RecentPrayerRequests() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recent Prayer Requests</h2>
      <div className="grid gap-6">
        {sampleRequests.map((request) => (
          <PrayerRequestCard
            key={`${request.author}-${request.date}`}
            {...request}
          />
        ))}
      </div>
    </div>
  );
} 