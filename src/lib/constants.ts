export const SITE_CONFIG = {
  name: 'CSR India',
  description: 'India\'s premier platform for CSR events, conferences, and knowledge sharing',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://csrindia.org',
  ogImage: '/images/og-default.jpg',
};

export const REGISTRATION_CATEGORIES = [
  { value: 'delegate', label: 'Delegate' },
  { value: 'vip', label: 'VIP' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'academic', label: 'Academic' },
  { value: 'media', label: 'Media' },
  { value: 'student', label: 'Student' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'other', label: 'Other' },
] as const;

export const PARTNER_TIERS = [
  { value: 'title', label: 'Title Partner', order: 1 },
  { value: 'platinum', label: 'Platinum Partner', order: 2 },
  { value: 'gold', label: 'Gold Partner', order: 3 },
  { value: 'silver', label: 'Silver Partner', order: 4 },
  { value: 'bronze', label: 'Bronze Partner', order: 5 },
  { value: 'media', label: 'Media Partner', order: 6 },
  { value: 'knowledge', label: 'Knowledge Partner', order: 7 },
  { value: 'community', label: 'Community Partner', order: 8 },
] as const;

export const SESSION_TYPES = [
  { value: 'keynote', label: 'Keynote' },
  { value: 'panel', label: 'Panel Discussion' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'fireside_chat', label: 'Fireside Chat' },
  { value: 'networking', label: 'Networking' },
  { value: 'break', label: 'Break' },
  { value: 'ceremony', label: 'Ceremony' },
] as const;

export const ADMIN_ROLES = ['super_admin', 'event_admin', 'content_admin', 'reviewer', 'checkin_staff'] as const;

export const ITEMS_PER_PAGE = 20;
