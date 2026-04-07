'use client';

import { useState } from 'react';
import { submitContactForm } from '@/lib/actions/contact-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const form = e.currentTarget;
      const result = await submitContactForm(new FormData(form));

      if (result.error) {
        if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setError('Failed to submit form. Please check your input.');
        }
      } else if (result.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          organization: '',
          subject: '',
          message: '',
        });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900">
              Message sent successfully!
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Thank you for contacting us. We will get back to you
              soon.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">
              Error
            </h4>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={e =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Your full name"
          disabled={loading}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={e =>
            setFormData({ ...formData, email: e.target.value })
          }
          placeholder="your@email.com"
          disabled={loading}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={e =>
            setFormData({ ...formData, phone: e.target.value })
          }
          placeholder="+91 (123) 456-7890"
          disabled={loading}
        />
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
          Organization
        </label>
        <Input
          id="organization"
          name="organization"
          type="text"
          value={formData.organization}
          onChange={e =>
            setFormData({
              ...formData,
              organization: e.target.value,
            })
          }
          placeholder="Your organization (optional)"
          disabled={loading}
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          required
          value={formData.subject}
          onChange={e =>
            setFormData({ ...formData, subject: e.target.value })
          }
          placeholder="What is your message about?"
          disabled={loading}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          required
          value={formData.message}
          onChange={e =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Tell us more about your inquiry..."
          rows={6}
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1B3A5C] hover:bg-[#152a47] text-white h-11 font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <p className="text-xs text-gray-600 text-center">
        We typically respond within 24 business hours
      </p>
    </form>
  );
}
