import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import {
  fetchFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  FriendRequest,
} from '@/store/slices/friendsSlice'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Check, X, Loader2 } from 'lucide-react'

function RequestCard({ request, onAccept, onReject }: {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={request.senderPhotoURL} alt={request.senderName} />
              <AvatarFallback>{request.senderName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{request.senderName}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={onAccept}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={onReject}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FriendRequests() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { sentRequests, receivedRequests, loading } = useSelector(
    (state: RootState) => state.friends
  )

  useEffect(() => {
    dispatch(fetchFriendRequests())
  }, [dispatch])

  const handleAccept = async (requestId: string) => {
    try {
      await dispatch(acceptFriendRequest(requestId)).unwrap()
      toast({
        title: 'Friend Request Accepted',
        description: 'You are now friends!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept friend request',
      })
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await dispatch(rejectFriendRequest(requestId)).unwrap()
      toast({
        title: 'Friend Request Rejected',
        description: 'The friend request has been rejected.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject friend request',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests</CardTitle>
        <CardDescription>
          Manage your friend requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received">
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No pending friend requests
              </p>
            ) : (
              receivedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAccept(request.id)}
                  onReject={() => handleReject(request.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No sent friend requests
              </p>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={request.senderPhotoURL} alt={request.senderName} />
                        <AvatarFallback>{request.senderName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{request.senderName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 
