'use client';

import { useState } from 'react';
import { createSession, updateSession } from '@/lib/actions/event-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

const SESSION_TYPES = [
  { value: 'keynote', label: 'Keynote' },
  { value: 'panel', label: 'Panel Discussion' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'fireside_chat', label: 'Fireside Chat' },
  { value: 'networking', label: 'Networking' },
  { value: 'break', label: 'Break' },
  { value: 'ceremony', label: 'Ceremony' },
];

type SessionFormProps = {
  eventId: string;
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    session_type: string;
    session_date: string;
    start_time: string;
    end_time: string;
    room: string | null;
    max_seats: number | null;
    display_order: number;
  };
  onSuccess?: () => void;
};

export function SessionForm({ eventId, initialData, onSuccess }: SessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    sessionType: initialData?.session_type || 'keynote',
    startDate: initialData?.session_date || '',
    startTime: initialData?.start_time?.slice(0, 5) || '09:00',
    endDate: initialData?.session_date || '',
    endTime: initialData?.end_time?.slice(0, 5) || '10:00',
    venue: initialData?.room || '',
    maxCapacity: initialData?.max_seats?.toString() || '',
    sortOrder: initialData?.display_order?.toString() || '0',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, sessionType: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('sessionType', formData.sessionType);
      form.append(
        'startTime',
        `${formData.startDate}T${formData.startTime}:00`
      );
      form.append(
        'endTime',
        `${formData.endDate}T${formData.endTime}:00`
      );
      form.append('venue', formData.venue);
      form.append('maxCapacity', formData.maxCapacity);
      form.append('sortOrder', formData.sortOrder);

      let result;
      if (initialData) {
        result = await updateSession(initialData.id, eventId, form);
      } else {
        result = await createSession(eventId, form);
      }

      if (result.error) {
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ submit: [result.error] });
        }
      } else {
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (fieldName: string) => {
    return errors[fieldName]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800">
            {Array.isArray(errors.submit) ? errors.submit[0] : errors.submit}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Session Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Opening Keynote"
          required
        />
        {getErrorMessage('title') && (
          <p className="text-sm text-red-600">{getErrorMessage('title')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sessionType">Session Type *</Label>
        <Select value={formData.sessionType} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getErrorMessage('sessionType') && (
          <p className="text-sm text-red-600">{getErrorMessage('sessionType')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          {getErrorMessage('startTime') && (
            <p className="text-sm text-red-600">{getErrorMessage('startTime')}</p>
          )}
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
          {getErrorMessage('endTime') && (
            <p className="text-sm text-red-600">{getErrorMessage('endTime')}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Brief description of the session"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            placeholder="e.g., Hall A"
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Display Order</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={handleInputChange}
          placeholder="Order to display in schedule"
          min="0"
        />
        <p className="text-xs text-gray-500">Lower numbers appear first</p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#1B3A5C] hover:bg-[#152a47] text-white flex-1"
        >
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : initialData ? (
            'Update Session'
          ) : (
            'Create Session'
          )}
        </Button>
      </div>
    </form>
  );
}
