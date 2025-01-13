import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  fetchSessionDetails,
  leaveGroupSession,
  updateSessionStatus,
  updateParticipantStatus,
  Participant,
} from '@/store/slices/groupSessionsSlice'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
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
import { Loader2, Users, Clock, LogOut } from 'lucide-react'

interface ParticipantCardProps {
  participant: Participant;
  isHost: boolean;
}

function ParticipantCard({ participant, isHost }: ParticipantCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={participant.photoURL} alt={participant.displayName} />
          <AvatarFallback>{participant.displayName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{participant.displayName}</p>
          <p className="text-sm text-muted-foreground">
            {participant.role === 'host' ? 'Host' : 'Participant'}
          </p>
        </div>
      </div>
      <Badge
        variant={participant.status === 'active' ? 'default' : 'secondary'}
      >
        {participant.status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  )
}

interface ActiveSessionProps {
  sessionId: string;
}

export default function ActiveSession({ sessionId }: ActiveSessionProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const { currentSession } = useSelector(
    (state: RootState) => state.groupSessions
  )
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.id
  )

  const { details: session, participants, loading } = currentSession
  const isHost = session?.hostId === currentUserId

  useEffect(() => {
    dispatch(fetchSessionDetails(sessionId))
  }, [dispatch, sessionId])

  useEffect(() => {
    if (!session) return

    const endTime = new Date(session.startTime).getTime() + session.duration * 60000
    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = endTime - now

      if (distance <= 0) {
        setTimeLeft('Session ended')
        if (session.status === 'in-progress' && isHost) {
          dispatch(updateSessionStatus({
            sessionId: session.id,
            status: 'completed',
          }))
        }
        return
      }

      const minutes = Math.floor(distance / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}m ${seconds}s`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [dispatch, session, isHost])

  const handleLeave = async () => {
    try {
      await dispatch(leaveGroupSession(sessionId)).unwrap()
      navigate('/group-sessions')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to leave session',
      })
    }
  }

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>
                Hosted by {session.hostName}
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to leave this prayer session?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeave}>
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{timeLeft}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {session.currentParticipants}/{session.maxParticipants} participants
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {session.prayerTopics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Participants</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {participants.map((participant) => (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    isHost={isHost}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <p className="text-sm text-muted-foreground">
            Session started {format(new Date(session.startTime), 'PPp')}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 
