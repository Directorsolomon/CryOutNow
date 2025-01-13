import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ConversationsList from '@/components/messages/ConversationsList'
import Conversation from '@/components/messages/Conversation'

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<string>()
  const conversations = useSelector(
    (state: RootState) => state.messages.conversations
  )

  const selectedConversation = conversations.find(
    c => c.participantId === selectedUserId
  )

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-12rem)]">
        <div className="h-full overflow-y-auto">
          <ConversationsList
            selectedId={selectedUserId}
            onSelect={setSelectedUserId}
          />
        </div>

        <div className="h-full">
          {selectedConversation ? (
            <Conversation
              userId={selectedConversation.participantId}
              userName={selectedConversation.participantName}
              userPhotoURL={selectedConversation.participantPhotoURL}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
