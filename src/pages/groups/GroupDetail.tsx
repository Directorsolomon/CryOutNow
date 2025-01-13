import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { PrayerGroup, GroupMember } from '@/types/group';
import { useAuth } from '@/hooks/useAuth';
import { ShareButton } from '@/components/ShareButton';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: group, isLoading } = useQuery<PrayerGroup>({
    queryKey: ['groups', id],
    queryFn: () => api.get(`/groups/${id}`).then(res => res.data),
  });

  const joinGroup = useMutation({
    mutationFn: () => api.post(`/groups/${id}/join`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast({
        title: 'Success',
        description: 'You have joined the group successfully',
      });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: () => api.post(`/groups/${id}/leave`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast({
        title: 'Success',
        description: 'You have left the group',
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const isCreator = group.creator?.id === user?.id;
  const isMember = group.members?.some(member => member.user_id === user?.id);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <span>Created by {group.creator?.displayName}</span>
            <Badge variant="secondary">{group.privacy}</Badge>
            <span>{group.members?.length || 0} members</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton
            title={`Join our prayer group: ${group.name}`}
            text={`Join us in prayer and fellowship at ${group.name}. ${group.description}`}
            url={window.location.href}
          />
          {!isCreator && (
            <Button
              onClick={() => isMember ? leaveGroup.mutate() : joinGroup.mutate()}
              variant={isMember ? "outline" : "default"}
            >
              {isMember ? 'Leave Group' : 'Join Group'}
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-gray-600">{group.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="prayers">Prayer Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
              {isMember && (
                <Button onClick={() => navigate(`/groups/${id}/sessions/create`)}>
                  Schedule Session
                </Button>
              )}
            </div>
            {group.sessions?.map(session => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        Scheduled for {new Date(session.scheduled_time).toLocaleString()}
                      </CardDescription>
                    </div>
                    <ShareButton
                      title={`Join our prayer session: ${session.title}`}
                      text={`Join us for a prayer session with ${group.name}. ${session.description}`}
                      url={`${window.location.href}/sessions/${session.id}`}
                      size="sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Duration: {session.duration_minutes} minutes
                    </span>
                    <Button variant="outline" size="sm">
                      Join Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Group Members</h2>
              {isCreator && (
                <Button onClick={() => navigate(`/groups/${id}/invite`)}>
                  Invite Members
                </Button>
              )}
            </div>
            {group.members?.map(member => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{member.user?.displayName}</span>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prayers">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Prayer Requests</h2>
              {isMember && (
                <Button onClick={() => navigate(`/groups/${id}/prayers/create`)}>
                  Add Prayer Request
                </Button>
              )}
            </div>
            {group.prayerRequests?.map(prayer => (
              <Card key={prayer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{prayer.title}</CardTitle>
                      <CardDescription>
                        By {prayer.user?.displayName} • {new Date(prayer.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <ShareButton
                      title={`Prayer Request: ${prayer.title}`}
                      text={`Please join me in prayer: ${prayer.content}`}
                      url={`${window.location.href}/prayers/${prayer.id}`}
                      size="sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{prayer.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {prayer.prayer_count} prayers
                    </span>
                    <Badge variant={prayer.status === 'answered' ? 'success' : 'default'}>
                      {prayer.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
