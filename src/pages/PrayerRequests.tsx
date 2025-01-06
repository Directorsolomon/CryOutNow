import { useState } from "react";
import { PrayerRequestList } from "../components/prayer-requests/PrayerRequestList";
import { CreatePrayerRequest } from "../components/prayer-requests/CreatePrayerRequest";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PrayerRequests() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsCreating(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prayer Requests</h1>
        {!isCreating && (
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Prayer Request
          </Button>
        )}
      </div>

      {isCreating ? (
        <CreatePrayerRequest />
      ) : (
        <PrayerRequestList />
      )}
    </div>
  );
} 