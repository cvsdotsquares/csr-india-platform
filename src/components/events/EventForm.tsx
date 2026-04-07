'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, updateEvent } from '@/lib/actions/event-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { slugify } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

type EventFormProps = {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    short_description: string | null;
    start_date: string;
    end_date: string;
    venue_name: string;
    venue_address: string | null;
    city: string;
    max_capacity: number | null;
    registration_end_date: string | null;
    registration_open: boolean;
    is_featured: boolean;
    status: string;
  };
  eventId?: string;
};

export function EventForm({ initialData, eventId }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.short_description || '',
    startDate: initialData?.start_date?.split('T')[0] || '',
    startTime: initialData?.start_date?.split('T')[1]?.slice(0, 5) || '09:00',
    endDate: initialData?.end_date?.split('T')[0] || '',
    endTime: initialData?.end_date?.split('T')[1]?.slice(0, 5) || '17:00',
    venue: initialData?.venue_name || '',
    venueAddress: initialData?.venue_address || '',
    city: initialData?.city || '',
    maxCapacity: initialData?.max_capacity?.toString() || '',
    registrationDeadline: initialData?.registration_end_date?.split('T')[0] || '',
    registrationDeadlineTime: initialData?.registration_end_date?.split('T')[1]?.slice(0, 5) || '17:00',
    isRegistrationOpen: initialData?.registration_open ?? true,
    isFeatured: initialData?.is_featured ?? false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'title' && !initialData) {
      setFormData(prev => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('slug', formData.slug);
      form.append('description', formData.description);
      form.append('shortDescription', formData.shortDescription);
      form.append(
        'startDate',
        `${formData.startDate}T${formData.startTime}:00`
      );
      form.append(
        'endDate',
        `${formData.endDate}T${formData.endTime}:00`
      );
      form.append('venue', formData.venue);
      form.append('venueAddress', formData.venueAddress);
      form.append('city', formData.city);
      form.append('maxCapacity', formData.maxCapacity);
      form.append(
        'registrationDeadline',
        formData.registrationDeadline
          ? `${formData.registrationDeadline}T${formData.registrationDeadlineTime}:00`
          : ''
      );
      form.append('isRegistrationOpen', String(formData.isRegistrationOpen));
      form.append('isFeatured', String(formData.isFeatured));

      let result;
      if (eventId) {
        result = await updateEvent(eventId, form);
      } else {
        result = await createEvent(form);
      }

      if (result.error) {
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ submit: [result.error] });
        }
      } else {
        router.push('/admin/events');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (fieldName: string) => {
    return errors[fieldName]?.[0];
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">
              {Array.isArray(errors.submit) ? errors.submit[0] : errors.submit}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Annual CSR Summit 2024"
              required
            />
            {getErrorMessage('title') && (
              <p className="text-sm text-red-600">{getErrorMessage('title')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="auto-generated from title"
              required
            />
            {getErrorMessage('slug') && (
              <p className="text-sm text-red-600">{getErrorMessage('slug')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Mumbai"
              required
            />
            {getErrorMessage('city') && (
              <p className="text-sm text-red-600">{getErrorMessage('city')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              placeholder="e.g., Convention Center"
              required
            />
            {getErrorMessage('venue') && (
              <p className="text-sm text-red-600">{getErrorMessage('venue')}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="venueAddress">Venue Address</Label>
            <Input
              id="venueAddress"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleInputChange}
              placeholder="Full address with postal code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
            {getErrorMessage('startDate') && (
              <p className="text-sm text-red-600">{getErrorMessage('startDate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
            {getErrorMessage('endDate') && (
              <p className="text-sm text-red-600">{getErrorMessage('endDate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Max Capacity</Label>
            <Input
              id="maxCapacity"
              name="maxCapacity"
              type="number"
              value={formData.maxCapacity}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
            <Input
              id="registrationDeadline"
              name="registrationDeadline"
              type="date"
              value={formData.registrationDeadline}
              onChange={handleInputChange}
            />
          </div>

          {formData.registrationDeadline && (
            <div className="space-y-2">
              <Label htmlFor="registrationDeadlineTime">Deadline Time</Label>
              <Input
                id="registrationDeadlineTime"
                name="registrationDeadlineTime"
                type="time"
                value={formData.registrationDeadlineTime}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            placeholder="Brief summary for event listings (max 300 chars)"
            maxLength={300}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
            rows={2}
          />
          <p className="text-sm text-gray-500">
            {formData.shortDescription.length}/300 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Full Description *</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed event description (supports HTML)"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] font-mono text-sm"
            rows={6}
          />
          {getErrorMessage('description') && (
            <p className="text-sm text-red-600">{getErrorMessage('description')}</p>
          )}
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold text-gray-900">Event Settings</h3>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isRegistrationOpen" className="font-medium">
                Open for Registration
              </Label>
              <p className="text-sm text-gray-600">
                Allow attendees to register for this event
              </p>
            </div>
            <Switch
              checked={formData.isRegistrationOpen}
              onCheckedChange={(value) => handleSwitchChange('isRegistrationOpen', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isFeatured" className="font-medium">
                Featured Event
              </Label>
              <p className="text-sm text-gray-600">
                Highlight this event on the main events page
              </p>
            </div>
            <Switch
              checked={formData.isFeatured}
              onCheckedChange={(value) => handleSwitchChange('isFeatured', value)}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#1B3A5C] hover:bg-[#152a47] text-white flex-1"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                {eventId ? 'Updating...' : 'Creating...'}
              </>
            ) : eventId ? (
              'Update Event'
            ) : (
              'Create Event'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
