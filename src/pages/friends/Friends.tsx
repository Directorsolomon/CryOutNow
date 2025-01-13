import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FriendsList from '@/components/friends/FriendsList'
import FriendRequests from '@/components/friends/FriendRequests'
import AddFriend from '@/components/friends/AddFriend'

export default function Friends() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Friends</h1>
      
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Friends List</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          <TabsTrigger value="add">Add Friend</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <FriendsList />
        </TabsContent>

        <TabsContent value="requests">
          <FriendRequests />
        </TabsContent>

        <TabsContent value="add">
          <AddFriend />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
