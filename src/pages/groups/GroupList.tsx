import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PrayerGroup } from '@/types/group';
import { api } from '@/lib/api';

export default function GroupList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [privacy, setPrivacy] = useState<string>('all');

  const { data: groups, isLoading } = useQuery<PrayerGroup[]>({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then(res => res.data)
  });

  const filteredGroups = groups?.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPrivacy = privacy === 'all' || group.privacy === privacy;
    return matchesSearch && matchesPrivacy;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prayer Groups</h1>
        <Button onClick={() => navigate('/groups/create')}>
          Create New Group
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={privacy} onValueChange={setPrivacy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by privacy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="invite_only">Invite Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups?.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>
                Created by {group.creator?.displayName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {group.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {group.members?.length || 0} members
                </span>
                <span className="capitalize px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  {group.privacy}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No groups found</h3>
          <p className="text-gray-600">
            Try adjusting your search or create a new group
          </p>
        </div>
      )}
    </div>
  );
} 
