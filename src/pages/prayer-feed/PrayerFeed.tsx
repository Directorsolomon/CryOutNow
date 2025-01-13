import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchPrayerRequests } from '@/store/slices/prayerFeedSlice'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import PrayerRequestCard from '@/components/prayer/PrayerRequestCard'
import PrayerFeedFilters from '@/components/prayer-feed/PrayerFeedFilters'
import CreatePrayerRequestForm from '@/components/prayer-feed/CreatePrayerRequestForm'

export default function PrayerFeed() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    items: requests,
    loading,
    hasMore,
    error,
    selectedTags,
    sortBy,
  } = useSelector((state: RootState) => state.prayerFeed)

  useEffect(() => {
    const loadInitialRequests = async () => {
      try {
        await dispatch(fetchPrayerRequests({
          page: 1,
          tags: selectedTags,
          sortBy,
        })).unwrap()
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load prayer requests',
        })
      }
    }

    loadInitialRequests()
  }, [dispatch, selectedTags, sortBy])

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loading && !isLoadingMore) {
          setIsLoadingMore(true)
          try {
            await dispatch(fetchPrayerRequests({
              page: Math.ceil(requests.length / 10) + 1,
              tags: selectedTags,
              sortBy,
            })).unwrap()
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to load more prayer requests',
            })
          } finally {
            setIsLoadingMore(false)
          }
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [dispatch, hasMore, loading, isLoadingMore, requests.length, selectedTags, sortBy])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-destructive">Failed to load prayer requests</p>
        <Button
          onClick={() => dispatch(fetchPrayerRequests({
            page: 1,
            tags: selectedTags,
            sortBy,
          }))}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prayer Feed</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Share Prayer Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Prayer Request</DialogTitle>
              <DialogDescription>
                Share your prayer needs with the community. We are here to pray with you.
              </DialogDescription>
            </DialogHeader>
            <CreatePrayerRequestForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-6">
          <PrayerFeedFilters />
        </aside>

        <main className="space-y-6">
          {loading && requests.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20" />
                <div className="space-x-2">
                  <Skeleton className="h-8 w-20 inline-block" />
                  <Skeleton className="h-8 w-20 inline-block" />
                </div>
              </div>
            ))
          ) : (
            <>
              {requests.map(request => (
                <PrayerRequestCard
                  key={request.id}
                  request={request}
                />
              ))}

              {hasMore && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isLoadingMore ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4 mx-auto" />
                      <Skeleton className="h-20" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading more prayers...</p>
                  )}
                </div>
              )}

              {!hasMore && requests.length > 0 && (
                <p className="text-center text-muted-foreground py-4">
                  You've reached the end of the prayer feed
                </p>
              )}

              {!hasMore && requests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No prayer requests found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Be the first to share a prayer request
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
} 
