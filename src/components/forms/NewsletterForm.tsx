'use client';

import { useState } from 'react';
import { subscribeNewsletter } from '@/lib/actions/contact-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'default' | 'white';
}

export default function NewsletterForm({
  variant = 'default',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await subscribeNewsletter(email);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
      console.error('Newsletter subscription error:', err);
    } finally {
      setLoading(false);
    }
  }

  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  const inputBgColor = variant === 'white' ? 'bg-white' : 'bg-gray-50';
  const successBg =
    variant === 'white' ? 'bg-green-600' : 'bg-green-50';
  const successText =
    variant === 'white'
      ? 'text-white'
      : 'text-green-900';
  const errorBg = variant === 'white' ? 'bg-red-600' : 'bg-red-50';
  const errorText = variant === 'white' ? 'text-white' : 'text-red-900';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Success Message */}
      {success && (
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${successBg} border ${
            variant === 'white'
              ? 'border-green-400'
              : 'border-green-200'
          }`}
        >
          <CheckCircle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              variant === 'white'
                ? 'text-white'
                : 'text-green-600'
            }`}
          />
          <div>
            <p className={`text-sm font-semibold ${successText}`}>
              Thank you for subscribing to our newsletter!
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${errorBg} border ${
            variant === 'white' ? 'border-red-400' : 'border-red-200'
          }`}
        >
          <AlertCircle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              variant === 'white' ? 'text-white' : 'text-red-600'
            }`}
          />
          <div>
            <p className={`text-sm font-semibold ${errorText}`}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {!success && (
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
            className={`${inputBgColor} ${
              variant === 'white'
                ? 'border-gray-300 placeholder-gray-500'
                : ''
            }`}
          />
          <Button
            type="submit"
            disabled={loading}
            className={`flex-shrink-0 ${
              variant === 'white'
                ? 'bg-[#1B3A5C] hover:bg-[#152a47] text-white'
                : 'bg-[#1B3A5C] hover:bg-[#152a47] text-white'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
