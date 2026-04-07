import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/dashboard/ProfileForm';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  organization: string | null;
  designation: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const profile = (data as UserProfile | null) || undefined;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-500">My Profile</h1>
      <div className="mt-8 max-w-2xl">
        <ProfileForm profile={profile} email={user.email!} />
      </div>
    </div>
  );
}
