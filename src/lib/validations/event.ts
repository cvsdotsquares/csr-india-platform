import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description is required'),
  shortDescription: z.string().max(300).optional(),
  startDate: z.string().datetime({ local: true }),
  endDate: z.string().datetime({ local: true }),
  venue: z.string().min(1, 'Venue is required'),
  venueAddress: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  maxCapacity: z.number().int().positive().optional(),
  registrationDeadline: z.string().datetime({ local: true }).optional(),
  isRegistrationOpen: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const sessionSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  sessionType: z.enum(['keynote', 'panel', 'workshop', 'fireside_chat', 'networking', 'break', 'ceremony']),
  startTime: z.string().datetime({ local: true }),
  endTime: z.string().datetime({ local: true }),
  venue: z.string().optional(),
  maxCapacity: z.number().int().positive().optional(),
  sortOrder: z.number().int().default(0),
});

export type EventInput = z.infer<typeof eventSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
