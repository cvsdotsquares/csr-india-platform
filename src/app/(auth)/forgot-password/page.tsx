'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="mt-2 text-base">
            We&apos;ve sent a password reset link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Click the link in the email to reset your password. The link will expire in 1 hour.</p>
          <p>Didn&apos;t receive the email? Check your spam folder or request another link.</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="mb-2 block font-bold text-brand-500">
          <span className="text-3xl">CSR India</span>
        </Link>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={loading}
              aria-label="Email address"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
