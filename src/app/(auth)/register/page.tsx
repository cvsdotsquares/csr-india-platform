'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp, signInWithGoogle } from '@/lib/auth/actions';
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

export default function RegisterPage() {
  const [error, setError] = useState<Record<string, string[]> | string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (!agreeTerms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(true);
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="mt-2 text-base">
            We&apos;ve sent a verification link to your email address. Please click the link to
            activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Didn&apos;t receive the email? Check your spam folder or try registering again.</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const getFieldError = (fieldName: string): string | undefined => {
    if (typeof error === 'object' && error && fieldName in error) {
      return error[fieldName]?.[0];
    }
    return undefined;
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="mb-2 block font-bold text-brand-500">
          <span className="text-3xl">CSR India</span>
        </Link>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <CardContent>
        {typeof error === 'string' && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              disabled={loading}
              aria-label="Full name"
            />
            {getFieldError('fullName') && (
              <p className="text-sm text-red-600">{getFieldError('fullName')}</p>
            )}
          </div>

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
            {getFieldError('email') && (
              <p className="text-sm text-red-600">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
              disabled={loading}
              aria-label="Password"
            />
            {getFieldError('password') && (
              <p className="text-sm text-red-600">{getFieldError('password')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              disabled={loading}
              aria-label="Confirm password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization (Optional)</Label>
            <Input
              id="organization"
              name="organization"
              type="text"
              placeholder="Your company or organization"
              disabled={loading}
              aria-label="Organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              disabled={loading}
              aria-label="Phone number"
            />
          </div>

          <div className="flex items-start space-x-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded border-gray-300"
              aria-label="Agree to terms and conditions"
            />
            <Label htmlFor="terms" className="text-sm font-normal">
              I agree to the{' '}
              <Link href="/terms" className="text-brand-500 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-500 hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !agreeTerms}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          type="button"
          disabled={googleLoading}
          aria-label="Sign up with Google"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {googleLoading ? 'Connecting...' : 'Google'}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
