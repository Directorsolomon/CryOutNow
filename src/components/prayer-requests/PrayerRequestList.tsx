import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrayerRequest, getRecentPrayerRequests, deletePrayerRequest } from "../../services/firebase";
import { PrayerRequestCard } from "./PrayerRequestCard";
import { useToast } from "../ui/use-toast";

export function PrayerRequestList() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPrayerRequests();
  }, []);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PER_PAGE = 10;

  const loadPrayerRequests = async () => {
    try {
      const recentRequests = await getRecentPrayerRequests(PER_PAGE, page);
      setRequests(prev => page === 1 ? recentRequests : [...prev, ...recentRequests]);
      setHasMore(recentRequests.length === PER_PAGE);
    } catch (error) {
      console.error("Error loading prayer requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load prayer requests. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      await deletePrayerRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Success",
        description: "Prayer request deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting prayer request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete prayer request. Please try again.",
      });
    }
  };

  const handleCardClick = (requestId: string) => {
    navigate(`/prayer-requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-full h-48 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No prayer requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id}
          className="cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => request.id && handleCardClick(request.id)}
        >
          <PrayerRequestCard
            request={request}
            onDelete={(e) => {
              e.stopPropagation();
              request.id && handleDelete(request.id);
            }}
          />
        </div>
      ))}
    </div>
  );
} 
