'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  organization: z.string().optional(),
  phone: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    organization: formData.get('organization'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, fullName, organization, phone } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      data: {
        full_name: fullName,
        organization,
        phone,
      },
    },
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  return { success: true, message: 'Check your email for verification link' };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  redirect('/dashboard');
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) return { error: 'Email is required' };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true, message: 'Check your email for password reset link' };
}

type UpdatePasswordInput =
  | FormData
  | {
      currentPassword?: string;
      newPassword: string;
    };

function normalizePasswordUpdate(input: UpdatePasswordInput) {
  if (input instanceof FormData) {
    return {
      currentPassword: (input.get('currentPassword') as string | null) || undefined,
      newPassword: (input.get('newPassword') as string | null) || (input.get('password') as string | null) || '',
    };
  }

  return {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  };
}

export async function updatePassword(input: UpdatePasswordInput) {
  const supabase = await createClient();
  const {
    currentPassword,
    newPassword,
  } = normalizePasswordUpdate(input);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters' };
  }

  if (currentPassword) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { error: 'Current password is incorrect' };
    }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Delete user's profile data
  await supabase.from('profiles').delete().eq('id', user.id);

  // Delete user from auth (this is a bit tricky in Supabase - we'll use admin API)
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) return { error: 'Failed to delete account' };

  // Sign out and redirect
  await supabase.auth.signOut();
  return { success: true };
}
