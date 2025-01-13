import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import { PrayerRequest, prayForRequest, markAsAnswered } from '@/store/slices/prayerFeedSlice'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  HandsPraying,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Props {
  request: PrayerRequest
  onComment: (requestId: string, comment: string) => void
}

export default function PrayerRequestCard({ request, onComment }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePray = async () => {
    try {
      await dispatch(prayForRequest(request.id)).unwrap()
      toast({
        title: 'Prayer Recorded',
        description: 'Thank you for praying for this request.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to record prayer. Please try again.',
      })
    }
  }

  const handleMarkAnswered = async () => {
    try {
      await dispatch(markAsAnswered(request.id)).unwrap()
      toast({
        title: 'Prayer Marked as Answered',
        description: 'Praise God for answered prayers!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark prayer as answered. Please try again.',
      })
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      await onComment(request.id, comment)
      setComment('')
      setShowCommentForm(false)
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={request.userPhotoURL} alt={request.userName} />
              <AvatarFallback>{request.userName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{request.userName}</div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          {request.isAnswered && (
            <Badge variant="success" className="ml-auto">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Answered
            </Badge>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{request.title}</h3>
          <p className="mt-2 text-muted-foreground">{request.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {request.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-4">
          <Button
            variant={request.hasPrayed ? 'default' : 'outline'}
            size="sm"
            onClick={handlePray}
            className="space-x-2"
          >
            <HandsPraying className="w-4 h-4" />
            <span>{request.prayerCount} Praying</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{request.commentCount} Comments</span>
            {showCommentForm ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          {request.userId === 'currentUser' && !request.isAnswered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAnswered}
              className="space-x-2 ml-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Answered</span>
            </Button>
          )}
        </div>
      </CardContent>

      {showCommentForm && (
        <CardFooter className="flex flex-col space-y-4">
          <Textarea
            placeholder="Share your thoughts or encouragement..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCommentForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
} 
