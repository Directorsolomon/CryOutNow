import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import PreferencesForm from '@/components/partner-matching/PreferencesForm'
import SuggestedPartners from '@/components/partner-matching/SuggestedPartners'
import PartnerRequests from '@/components/partner-matching/PartnerRequests'

export default function PrayerPartners() {
  const { preferences } = useSelector(
    (state: RootState) => state.partnerMatching
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Prayer Partners</h1>
      </div>

      <Tabs defaultValue={preferences ? 'suggestions' : 'preferences'}>
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-6">
          <PreferencesForm />
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          {preferences ? (
            <SuggestedPartners />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Please set your preferences first to see suggested prayer partners.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <PartnerRequests />
        </TabsContent>
      </Tabs>
    </div>
  )
} 