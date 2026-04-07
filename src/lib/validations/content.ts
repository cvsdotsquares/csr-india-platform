import { z } from 'zod';

export const cmsPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1, 'Content is required'),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  template: z.string().default('default'),
  sortOrder: z.number().int().default(0),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300).optional(),
  categoryId: z.string().uuid().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional(),
  organization: z.string().optional(),
});

export type CmsPageInput = z.infer<typeof cmsPageSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
