import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PrayerRequest {
  id: string;
  author: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
}

const recentPrayerRequests: PrayerRequest[] = [
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

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Welcome to CryOutNow</h1>
          <p className="text-muted-foreground mb-8">A place to share and support prayer requests</p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/prayer-requests">View Prayer Requests</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Recent Prayer Requests */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Recent Prayer Requests</h2>
          <div className="grid gap-6">
            {recentPrayerRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{request.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{request.author}</span>
                      <span>•</span>
                      <span>{request.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{request.content}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {request.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{request.likes}</span>
                  </button>
                  <button className="flex items-center gap-1">
                    <span>💭</span>
                    <span>{request.comments}</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/prayer-requests">View All Prayer Requests</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
