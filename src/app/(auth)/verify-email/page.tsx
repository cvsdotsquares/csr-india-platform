'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function VerifyEmailPage() {
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
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-base">
          We&apos;ve sent a verification link to your email address. Please click the link to
          verify your email and complete your registration.
        </CardDescription>
        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            The link will expire in 24 hours. If you don&apos;t see it, check your spam folder.
          </p>
          <p className="text-sm text-muted-foreground">
            Once verified, you&apos;ll be able to log in to your account and access all features.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Back to Login
          </Button>
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Didn&apos;t receive the email?{' '}
          <Link href="/register" className="text-brand-500 hover:underline">
            Try registering again
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
