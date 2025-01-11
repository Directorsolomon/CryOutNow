import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import { fetchConversations, Conversation } from '@/store/slices/messagesSlice'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={conversation.participantPhotoURL}
              alt={conversation.participantName}
            />
            <AvatarFallback>
              {conversation.participantName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {conversation.participantName}
              </h4>
              {conversation.lastMessage && (
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              {conversation.lastMessage ? (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No messages yet
                </p>
              )}
              {conversation.unreadCount > 0 && (
                <Badge variant="secondary">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ConversationsListProps {
  selectedId?: string;
  onSelect: (userId: string) => void;
}

export default function ConversationsList({
  selectedId,
  onSelect,
}: ConversationsListProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { conversations, loading } = useSelector(
    (state: RootState) => state.messages
  )

  useEffect(() => {
    dispatch(fetchConversations())
  }, [dispatch])

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
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Your conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No conversations yet
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.participantId}
              onClick={() => onSelect(conversation.participantId)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
} 