import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import {
  fetchGroupSessions,
  joinGroupSession,
  GroupSession,
} from '@/store/slices/groupSessionsSlice'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Users, Lock } from 'lucide-react'

interface SessionCardProps {
  session: GroupSession;
  onJoin: () => void;
}

function SessionCard({ session, onJoin }: SessionCardProps) {
  const isUpcoming = new Date(session.startTime) > new Date()
  const canJoin = isUpcoming && session.currentParticipants < session.maxParticipants

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={session.hostPhotoURL} alt={session.hostName} />
              <AvatarFallback>{session.hostName[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{session.title}</h4>
                {session.isPrivate && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Hosted by {session.hostName}
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {session.currentParticipants}/{session.maxParticipants} participants
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.prayerTopics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-sm font-medium">
              {format(new Date(session.startTime), 'PPP')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(session.startTime), 'p')}
            </p>
            <p className="text-sm text-muted-foreground">
              {session.duration} minutes
            </p>
            <Button
              size="sm"
              variant={canJoin ? "default" : "secondary"}
              disabled={!canJoin}
              onClick={onJoin}
            >
              {session.status === 'in-progress'
                ? 'In Progress'
                : session.status === 'completed'
                ? 'Completed'
                : session.currentParticipants >= session.maxParticipants
                ? 'Full'
                : 'Join Session'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SessionsList() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { sessions, loading } = useSelector(
    (state: RootState) => state.groupSessions
  )

  useEffect(() => {
    dispatch(fetchGroupSessions())
  }, [dispatch])

  const handleJoin = async (sessionId: string) => {
    try {
      await dispatch(joinGroupSession(sessionId)).unwrap()
      navigate(`/group-sessions/${sessionId}`)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to join session',
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

  const upcomingSessions = sessions.filter(
    session => new Date(session.startTime) > new Date()
  )
  const ongoingSessions = sessions.filter(
    session => session.status === 'in-progress'
  )
  const pastSessions = sessions.filter(
    session => session.status === 'completed'
  )

  return (
    <div className="space-y-6">
      {ongoingSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ongoing Sessions</h2>
          <div className="space-y-4">
            {ongoingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={() => handleJoin(session.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No upcoming sessions
            </p>
          ) : (
            upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={() => handleJoin(session.id)}
              />
            ))
          )}
        </div>
      </div>

      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Sessions</h2>
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={() => handleJoin(session.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 