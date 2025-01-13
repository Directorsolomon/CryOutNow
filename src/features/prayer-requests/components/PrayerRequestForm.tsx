/**
 * @file PrayerRequestForm.tsx
 * @description Form component for creating and editing prayer requests
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  useCreatePrayerRequest, 
  useUpdatePrayerRequest 
} from '../hooks/usePrayerRequests';
import { PrayerRequest, PrayerRequestStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  isPrivate: z.boolean(),
  status: z.nativeEnum(PrayerRequestStatus),
  tags: z.string().optional(),
  scriptureReferences: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PrayerRequestFormProps {
  prayerRequest?: PrayerRequest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * PrayerRequestForm Component
 * @component
 * @description Form for creating or editing prayer requests
 */
export function PrayerRequestForm({ 
  prayerRequest, 
  onSuccess, 
  onCancel 
}: PrayerRequestFormProps) {
  const { user } = useAuth();
  const createRequest = useCreatePrayerRequest();
  const updateRequest = useUpdatePrayerRequest();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: prayerRequest?.title || '',
      description: prayerRequest?.description || '',
      isPrivate: prayerRequest?.isPrivate || false,
      status: prayerRequest?.status || PrayerRequestStatus.ACTIVE,
      tags: prayerRequest?.tags?.join(', ') || '',
      scriptureReferences: prayerRequest?.scriptureReferences?.join(', ') || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const requestData = {
      ...data,
      userId: user!.uid,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : undefined,
      scriptureReferences: data.scriptureReferences 
        ? data.scriptureReferences.split(',').map(ref => ref.trim()) 
        : undefined,
    };

    try {
      if (prayerRequest) {
        await updateRequest.mutateAsync({
          id: prayerRequest.id,
          data: requestData,
        });
      } else {
        await createRequest.mutateAsync(requestData);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

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
                <Input placeholder="Enter a title for your prayer request" {...field} />
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
                  placeholder="Describe your prayer request..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <Label>Private Request</Label>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PrayerRequestStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="faith, healing, family" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scriptureReferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scripture References (comma-separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John 3:16, Psalm 23" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={createRequest.isPending || updateRequest.isPending}
          >
            {createRequest.isPending || updateRequest.isPending
              ? 'Saving...'
              : prayerRequest
              ? 'Update Request'
              : 'Create Request'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
} 