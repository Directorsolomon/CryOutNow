import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import SessionsList from '@/components/group-sessions/SessionsList'
import CreateSessionForm from '@/components/group-sessions/CreateSessionForm'

export default function GroupSessions() {
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.id
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Group Prayer Sessions</h1>
        {currentUserId && <CreateSessionForm />}
      </div>
      
      <SessionsList />
    </div>
  )
} 