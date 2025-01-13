import { useParams } from 'react-router-dom'
import ActiveSession from '@/components/group-sessions/ActiveSession'

export default function GroupSession() {
  const { sessionId } = useParams<{ sessionId: string }>()

  if (!sessionId) {
    return (
      <div className="container py-6">
        <p className="text-center text-muted-foreground">
          Session not found
        </p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <ActiveSession sessionId={sessionId} />
    </div>
  )
} 
