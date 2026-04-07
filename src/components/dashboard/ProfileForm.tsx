'use client';
import { useState, useTransition } from 'react';
import { updateProfile } from '@/lib/actions/profile-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';

interface ProfileFormProps {
  profile: any;
  email: string;
}

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) toast.success('Profile updated successfully');
      else toast.error(result.error || 'Failed to update profile');
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-brand-500 text-white text-xl">
              {getInitials(profile?.full_name || email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.full_name || 'User'}</CardTitle>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={profile?.full_name || ''} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" name="organization" defaultValue={profile?.organization || ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" name="designation" defaultValue={profile?.designation || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={profile?.bio || ''} rows={4} placeholder="Tell us about yourself..." />
          </div>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
