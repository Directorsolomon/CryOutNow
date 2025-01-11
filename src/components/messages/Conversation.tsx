import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import {
  fetchMessages,
  sendMessage,
  markAsRead,
  Message,
} from '@/store/slices/messagesSlice'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
}

function MessageBubble({ message, isSender }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex items-end space-x-2',
        isSender && 'flex-row-reverse space-x-reverse'
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.senderPhotoURL} alt={message.senderName} />
        <AvatarFallback>{message.senderName?.[0]}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isSender
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(message.createdAt), {
          addSuffix: true,
        })}
      </p>
    </div>
  )
}

interface ConversationProps {
  userId: string;
  userName: string;
  userPhotoURL?: string;
}

export default function Conversation({
  userId,
  userName,
  userPhotoURL,
}: ConversationProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { messages, loading, hasMore } = useSelector(
    (state: RootState) => state.messages.currentConversation
  )
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.id
  )

  useEffect(() => {
    dispatch(fetchMessages({ userId }))
    dispatch(markAsRead(userId))
  }, [dispatch, userId])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          const oldestMessage = messages[0]
          if (oldestMessage) {
            dispatch(fetchMessages({
              userId,
              lastMessageId: oldestMessage.id,
            }))
          }
        }
      },
      { threshold: 1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [dispatch, userId, hasMore, loading, messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await dispatch(sendMessage({
        userId,
        content: newMessage.trim(),
      })).unwrap()
      setNewMessage('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={userPhotoURL} alt={userName} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{userName}</CardTitle>
            <CardDescription>
              {messages.length} messages
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div ref={loadMoreRef} className="h-4" />
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSender={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex space-x-2 w-full">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="flex-1"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 