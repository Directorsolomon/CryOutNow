import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import {
  respondToRequest,
  endPartnership,
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
import { Check, X, UserMinus } from 'lucide-react'

interface PartnerRequestCardProps {
  partner: PrayerPartner;
  onAccept: () => void;
  onDecline: () => void;
}

function PartnerRequestCard({ partner, onAccept, onDecline }: PartnerRequestCardProps) {
  const commonTopics = partner.preferences.prayerTopics.slice(0, 3)

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
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="default"
              onClick={onAccept}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDecline}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CurrentPartnerCardProps {
  partner: PrayerPartner;
  onEnd: () => void;
}

function CurrentPartnerCard({ partner, onEnd }: CurrentPartnerCardProps) {
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                End Partnership
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Prayer Partnership</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this prayer partnership?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onEnd}>
                  End Partnership
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PartnerRequests() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { suggestedPartners, currentPartner } = useSelector(
    (state: RootState) => state.partnerMatching
  )

  const pendingRequests = suggestedPartners.filter(
    partner => partner.status === 'pending'
  )

  const handleAccept = async (partnerId: string) => {
    try {
      await dispatch(respondToRequest({ partnerId, accept: true })).unwrap()
      toast({
        title: 'Success',
        description: 'Prayer partner request accepted',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept request',
      })
    }
  }

  const handleDecline = async (partnerId: string) => {
    try {
      await dispatch(respondToRequest({ partnerId, accept: false })).unwrap()
      toast({
        title: 'Success',
        description: 'Prayer partner request declined',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline request',
      })
    }
  }

  const handleEndPartnership = async (partnerId: string) => {
    try {
      await dispatch(endPartnership(partnerId)).unwrap()
      toast({
        title: 'Success',
        description: 'Prayer partnership ended successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to end partnership',
      })
    }
  }

  return (
    <div className="space-y-6">
      {currentPartner && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Partner</h2>
          <CurrentPartnerCard
            partner={currentPartner}
            onEnd={() => handleEndPartnership(currentPartner.id)}
          />
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((partner) => (
              <PartnerRequestCard
                key={partner.id}
                partner={partner}
                onAccept={() => handleAccept(partner.id)}
                onDecline={() => handleDecline(partner.id)}
              />
            ))}
          </div>
        </div>
      )}

      {!currentPartner && pendingRequests.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Active Partnerships</CardTitle>
            <CardDescription>
              You don't have any current prayer partners or pending requests.
              Try finding a prayer partner in the suggestions tab.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
} 