import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AppDispatch } from '@/store'
import { createPrayerRequest } from '@/store/slices/prayerFeedSlice'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { X } from 'lucide-react'

const COMMON_TAGS = [
  'Healing',
  'Family',
  'Guidance',
  'Peace',
  'Strength',
  'Faith',
  'Work',
  'Relationships',
]

const requestSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
})

type FormData = z.infer<typeof requestSchema>

export default function CreatePrayerRequestForm({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const onSubmit = async (data: FormData) => {
    if (selectedTags.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one tag for your prayer request.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await dispatch(createPrayerRequest({
        ...data,
        tags: selectedTags,
      })).unwrap()
      toast({
        title: 'Success',
        description: 'Your prayer request has been shared.',
      })
      onClose()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create prayer request',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a brief title for your prayer request"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your prayer request in detail..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X
                    className="w-3 h-3 ml-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTag(tag)
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
          {selectedTags.length === 0 && (
            <p className="text-sm text-destructive">
              Please select at least one tag
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || selectedTags.length === 0}
          >
            {isSubmitting ? 'Sharing...' : 'Share Prayer Request'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 
