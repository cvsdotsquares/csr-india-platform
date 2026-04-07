'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await (supabase.from('profiles') as any).update({
    full_name: formData.get('fullName') as string,
    phone: formData.get('phone') as string || null,
    organization: formData.get('organization') as string || null,
    designation: formData.get('designation') as string || null,
    bio: formData.get('bio') as string || null,
  }).eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/profile');
  return { success: true };
}
