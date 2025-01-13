import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import {
  fetchFriends,
  removeFriend,
  Friend,
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
import { useToast } from '@/components/ui/use-toast'
import { UserX, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function FriendCard({ friend, onRemove }: {
  friend: Friend;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={friend.photoURL} alt={friend.displayName} />
              <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{friend.displayName}</h4>
              <p className="text-sm text-muted-foreground">
                Friends since {formatDistanceToNow(new Date(friend.friendsSince), { addSuffix: true })}
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
              >
                <UserX className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {friend.displayName} from your friends list?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FriendsList() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { friends, loading } = useSelector(
    (state: RootState) => state.friends
  )

  useEffect(() => {
    dispatch(fetchFriends())
  }, [dispatch])

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await dispatch(removeFriend(friendId)).unwrap()
      toast({
        title: 'Friend Removed',
        description: 'The friend has been removed from your list.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove friend',
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
        <CardTitle>Friends</CardTitle>
        <CardDescription>
          Manage your friends list
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {friends.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            You haven't added any friends yet
          </p>
        ) : (
          friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onRemove={() => handleRemoveFriend(friend.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
} 
