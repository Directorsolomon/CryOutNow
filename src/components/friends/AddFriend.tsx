import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { searchUsers, sendFriendRequest } from '@/store/slices/friendsSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { UserPlus, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  displayName: string
  photoURL?: string
  isFriend: boolean
  hasPendingRequest: boolean
}

export default function AddFriend() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const results = await dispatch(searchUsers(searchQuery)).unwrap()
      setSearchResults(results)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to search users',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await dispatch(sendFriendRequest(userId)).unwrap()
      toast({
        title: 'Friend Request Sent',
        description: 'Your friend request has been sent successfully.',
      })
      // Update the search results to show the pending request
      setSearchResults(results =>
        results.map(result =>
          result.id === userId
            ? { ...result, hasPendingRequest: true }
            : result
        )
      )
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send friend request',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Friend</CardTitle>
        <CardDescription>
          Search for users to add as friends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {searchResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={result.photoURL} alt={result.displayName} />
                      <AvatarFallback>{result.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{result.displayName}</h4>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={result.isFriend ? "secondary" : "default"}
                    disabled={result.isFriend || result.hasPendingRequest}
                    onClick={() => handleSendRequest(result.id)}
                  >
                    {result.isFriend ? (
                      'Already Friends'
                    ) : result.hasPendingRequest ? (
                      'Request Sent'
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 
