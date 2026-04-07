export const ROLE_HIERARCHY = {
  super_admin: 100,
  event_admin: 80,
  content_admin: 70,
  reviewer: 60,
  checkin_staff: 50,
  registered_user: 10,
} as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  event_admin: 'Event Admin',
  content_admin: 'Content Admin',
  reviewer: 'Reviewer',
  checkin_staff: 'Check-in Staff',
  registered_user: 'Registered User',
};

export const ROLE_PERMISSIONS = {
  super_admin: ['*'],
  event_admin: ['events.*', 'registrations.*', 'sessions.*', 'speakers.*', 'volunteers.*', 'check_in.*', 'reports.view'],
  content_admin: ['content.*', 'blog.*', 'media.*', 'pages.*', 'partners.*'],
  reviewer: ['registrations.review', 'speakers.review', 'volunteers.review'],
  checkin_staff: ['check_in.*', 'registrations.view'],
  registered_user: ['profile.*', 'registrations.own'],
} as const;
