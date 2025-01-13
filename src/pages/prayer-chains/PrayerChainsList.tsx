import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store"
import { fetchPrayerChains } from "@/store/slices/prayerChainsSlice"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Participant {
  id: string;
  name: string;
}

interface PrayerChain {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  participants: Participant[];
  maxParticipants: number;
  turnDurationDays: number;
  currentTurn: Participant | null;
}

interface PrayerChainsState {
  chains: PrayerChain[];
  loading: boolean;
  error: string | null;
}

export default function PrayerChainsList() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { chains, loading, error } = useSelector((state: RootState) => state.prayerChains as PrayerChainsState)
  const { toast } = useToast()

  useEffect(() => {
    const loadChains = async () => {
      try {
        await dispatch(fetchPrayerChains()).unwrap()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load prayer chains",
          variant: "destructive",
        })
      }
    }
    loadChains()
  }, [dispatch, toast])

  const handleChainClick = (chainId: string) => {
    navigate(`/prayer-chains/${chainId}`)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Prayer Chains</h1>
        <Button onClick={() => navigate("/prayer-chains/create")}>
          Create New Chain
        </Button>
      </div>

      {chains.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No prayer chains found.</p>
          <p className="mt-2">
            Start by creating a new prayer chain to connect with others in prayer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chains.map((chain: PrayerChain) => (
            <div
              key={chain.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleChainClick(chain.id)}
            >
              <h2 className="text-xl font-semibold mb-2">{chain.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{chain.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{chain.participants.length} / {chain.maxParticipants} participants</span>
                <span>{chain.turnDurationDays} days per turn</span>
              </div>
              {chain.currentTurn && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Current turn: <span className="font-medium">{chain.currentTurn.name}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
