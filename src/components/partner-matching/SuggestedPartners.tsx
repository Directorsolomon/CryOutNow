import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import {
  fetchSuggestedPartners,
  requestPartner,
  PrayerPartner,
} from '@/store/slices/partnerMatchingSlice'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, UserPlus } from 'lucide-react'

interface PartnerCardProps {
  partner: PrayerPartner;
  onRequest: () => void;
}

function PartnerCard({ partner, onRequest }: PartnerCardProps) {
  const commonTopics = partner.preferences.prayerTopics.slice(0, 3)
  const commonLanguages = partner.preferences.preferredLanguages.slice(0, 2)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={partner.photoURL} alt={partner.displayName} />
              <AvatarFallback>{partner.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-medium">{partner.displayName}</h4>
              <p className="text-sm text-muted-foreground">
                {partner.preferences.experienceLevel} prayer partner
              </p>
              <div className="flex flex-wrap gap-2">
                {commonTopics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Languages: {commonLanguages.join(', ')}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-sm font-medium">
              {Math.round(partner.matchScore * 100)}% match
            </div>
            <Button
              size="sm"
              variant={partner.status === 'pending' ? 'secondary' : 'default'}
              disabled={partner.status === 'pending'}
              onClick={onRequest}
            >
              {partner.status === 'pending' ? (
                'Request Sent'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SuggestedPartners() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { suggestedPartners, loading } = useSelector(
    (state: RootState) => state.partnerMatching
  )

  useEffect(() => {
    dispatch(fetchSuggestedPartners())
  }, [dispatch])

  const handleRequest = async (partnerId: string) => {
    try {
      await dispatch(requestPartner(partnerId)).unwrap()
      toast({
        title: 'Success',
        description: 'Prayer partner request sent successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send request',
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

  if (suggestedPartners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Matches Found</CardTitle>
          <CardDescription>
            We couldn't find any prayer partners matching your preferences at the moment.
            Try adjusting your preferences or check back later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {suggestedPartners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            onRequest={() => handleRequest(partner.id)}
          />
        ))}
      </div>
    </ScrollArea>
  )
} 
