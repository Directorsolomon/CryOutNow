import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const createGroupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  privacy: z.enum(['public', 'private', 'invite_only']),
  maxMembers: z.number().min(2).max(1000),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroup() {
  const navigate = useNavigate();
  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      privacy: 'public',
      maxMembers: 100,
    },
  });

  const createGroup = useMutation({
    mutationFn: (data: CreateGroupForm) =>
      api.post('/groups', data).then((res) => res.data),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Prayer group created successfully',
      });
      navigate(`/groups/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create prayer group. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroup.mutate(data);
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Prayer Group</h1>
        <p className="text-gray-600 mt-2">
          Create a new prayer group to connect and pray with others
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
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
                    placeholder="Describe the purpose of your group"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Privacy Setting</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxMembers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Members</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={1000}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/groups')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGroup.isPending}
            >
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 