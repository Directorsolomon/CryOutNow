import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import CommunityGuidelines from '@/components/moderation/CommunityGuidelines'
import ReportsManagement from '@/components/moderation/ReportsManagement'

export default function Moderation() {
  const { user } = useSelector((state: RootState) => state.auth)
  const isModerator = user?.roles?.includes('moderator')

  if (!isModerator) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
          Only moderators can access the moderation dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="guidelines">Community Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          <ReportsManagement />
        </TabsContent>

        <TabsContent value="guidelines" className="mt-6">
          <CommunityGuidelines />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
