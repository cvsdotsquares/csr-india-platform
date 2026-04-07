'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitRegistration } from '@/lib/actions/registration-actions';
import { REGISTRATION_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
}

export function RegistrationForm({ eventId, eventTitle }: RegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    organization: '',
    designation: '',
    dietaryPreferences: '',
    specialRequirements: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('eventId', eventId);
      formDataObj.append('category', formData.category);
      formDataObj.append('organization', formData.organization);
      formDataObj.append('designation', formData.designation);
      formDataObj.append('dietaryPreferences', formData.dietaryPreferences);
      formDataObj.append('specialRequirements', formData.specialRequirements);

      const result = await submitRegistration(formDataObj);

      if (result.error) {
        if (typeof result.error === 'string') {
          toast.error(result.error);
        } else {
          toast.error('Validation failed. Please check your inputs.');
        }
      } else if (result.success) {
        toast.success('Successfully registered for the event!');
        router.push('/dashboard/registrations');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-[#1B3A5C] mb-2">Registering for:</h3>
        <p className="text-gray-700">{eventTitle}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-base font-semibold">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.category} onValueChange={handleSelectChange}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Select your category" />
          </SelectTrigger>
          <SelectContent>
            {REGISTRATION_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!formData.category && (
          <p className="text-sm text-red-500">Category is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization" className="text-base font-semibold">
          Organization <span className="text-red-500">*</span>
        </Label>
        <Input
          id="organization"
          name="organization"
          placeholder="Enter your organization name"
          value={formData.organization}
          onChange={handleChange}
          required
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="designation" className="text-base font-semibold">
          Designation <span className="text-red-500">*</span>
        </Label>
        <Input
          id="designation"
          name="designation"
          placeholder="Enter your job designation"
          value={formData.designation}
          onChange={handleChange}
          required
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dietaryPreferences" className="text-base font-semibold">
          Dietary Preferences
        </Label>
        <Textarea
          id="dietaryPreferences"
          name="dietaryPreferences"
          placeholder="E.g., Vegetarian, Vegan, Gluten-free, etc."
          value={formData.dietaryPreferences}
          onChange={handleChange}
          rows={3}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequirements" className="text-base font-semibold">
          Special Requirements
        </Label>
        <Textarea
          id="specialRequirements"
          name="specialRequirements"
          placeholder="E.g., Wheelchair accessibility, sign language interpreter, etc."
          value={formData.specialRequirements}
          onChange={handleChange}
          rows={3}
          className="text-base"
        />
      </div>

      <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={() => setAcceptedTerms(!acceptedTerms)}
        />
        <Label
          htmlFor="terms"
          className="text-sm text-gray-700 cursor-pointer leading-relaxed font-normal"
        >
          I agree to the terms and conditions, and I understand that my registration will be
          subject to approval by the event organizers. I also consent to receive communications
          about this event.
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !acceptedTerms}
        className="w-full bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white font-semibold h-11"
      >
        {isLoading ? 'Registering...' : 'Submit Registration'}
      </Button>
    </form>
  );
}
