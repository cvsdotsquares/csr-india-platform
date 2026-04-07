'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updatePassword } from '@/lib/auth/actions';
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

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setPasswordsMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(newPassword === e.target.value);
  };

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="mb-2 block font-bold text-brand-500">
          <span className="text-3xl">CSR India</span>
        </Link>
        <CardTitle>Create New Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
              value={newPassword}
              onChange={handlePasswordChange}
              disabled={loading}
              aria-label="New password"
            />
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters, including uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={loading}
              className={!passwordsMatch && confirmPassword ? 'border-red-500' : ''}
              aria-label="Confirm password"
            />
            {!passwordsMatch && confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
            {passwordsMatch && confirmPassword && (
              <p className="text-sm text-green-600">Passwords match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !passwordsMatch || !newPassword || !confirmPassword}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
