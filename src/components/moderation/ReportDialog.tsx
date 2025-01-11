import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { submitReport } from '@/store/slices/moderationSlice'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Flag, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Offensive Language' },
  { value: 'other', label: 'Other' },
] as const

const formSchema = z.object({
  reason: z.enum(['inappropriate', 'harassment', 'spam', 'offensive', 'other']),
  description: z.string().min(10, 'Please provide more details about the issue'),
})

interface ReportDialogProps {
  targetId: string;
  targetType: 'user' | 'prayer-request' | 'comment' | 'prayer-chain' | 'message';
  children: React.ReactNode;
}

export default function ReportDialog({ targetId, targetType, children }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: 'inappropriate',
      description: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await dispatch(submitReport({
        targetId,
        targetType,
        reason: values.reason,
        description: values.description,
        reporterId: '', // This will be filled by the backend
        reporterName: '', // This will be filled by the backend
      })).unwrap()

      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping keep our community safe.',
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit report',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us maintain a safe and respectful community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Report</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REPORT_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {...field}
                      placeholder="Please provide details about why you're reporting this content..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Include any relevant details that will help our moderators review this report.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 