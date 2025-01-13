import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import {
  fetchGuidelines,
  updateGuideline,
  CommunityGuideline,
} from '@/store/slices/moderationSlice'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Shield } from 'lucide-react'

const CATEGORY_COLORS = {
  general: 'default',
  prayer: 'secondary',
  communication: 'destructive',
  respect: 'primary',
  privacy: 'outline',
} as const

export default function CommunityGuidelines() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { guidelines, loading } = useSelector(
    (state: RootState) => state.moderation
  )

  useEffect(() => {
    dispatch(fetchGuidelines())
  }, [dispatch])

  const guidelinesByCategory = guidelines.reduce((acc, guideline) => {
    if (!acc[guideline.category]) {
      acc[guideline.category] = []
    }
    acc[guideline.category].push(guideline)
    return acc
  }, {} as Record<CommunityGuideline['category'], CommunityGuideline[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (guidelines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
          <CardDescription>
            No guidelines have been created yet. Please check back later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Community Guidelines</h2>
      </div>

      <div className="grid gap-6">
        {Object.entries(guidelinesByCategory).map(([category, categoryGuidelines]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{category}</CardTitle>
                <Badge variant={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}>
                  {categoryGuidelines.length} Guidelines
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {categoryGuidelines
                  .sort((a, b) => a.order - b.order)
                  .map((guideline) => (
                    <AccordionItem key={guideline.id} value={guideline.id}>
                      <AccordionTrigger>{guideline.title}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          {guideline.description}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
