import { z } from 'zod';

export const registrationSchema = z.object({
  eventId: z.string().uuid(),
  category: z.enum(['delegate', 'vip', 'corporate', 'government', 'ngo', 'academic', 'media', 'student', 'speaker', 'volunteer', 'other']),
  organization: z.string().min(1, 'Organization is required'),
  designation: z.string().min(1, 'Designation is required'),
  dietaryPreferences: z.string().optional(),
  specialRequirements: z.string().optional(),
});

export const speakerApplicationSchema = z.object({
  eventId: z.string().uuid(),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000),
  topic: z.string().min(5, 'Topic is required'),
  abstract: z.string().min(100, 'Abstract must be at least 100 characters').max(2000),
  previousExperience: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const volunteerApplicationSchema = z.object({
  eventId: z.string().uuid(),
  motivation: z.string().min(20, 'Please describe your motivation'),
  availability: z.string().min(1, 'Availability is required'),
  skills: z.string().optional(),
  previousExperience: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type SpeakerApplicationInput = z.infer<typeof speakerApplicationSchema>;
export type VolunteerApplicationInput = z.infer<typeof volunteerApplicationSchema>;
