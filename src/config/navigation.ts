import {
  LayoutDashboard, Calendar, Users, FileText, Image, Settings,
  BarChart3, Shield, Mail, Globe, BookOpen, HelpCircle, MessageSquare,
  UserCheck, Handshake, ClipboardList, QrCode
} from 'lucide-react';

export const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    name: 'Events',
    href: '/admin/events',
    icon: Calendar,
    children: [
      { name: 'All Events', href: '/admin/events' },
      { name: 'Create Event', href: '/admin/events/new' },
    ],
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
    children: [
      { name: 'Pages', href: '/admin/content/pages' },
      { name: 'Blog Posts', href: '/admin/content/blog' },
      { name: 'Media Library', href: '/admin/content/media' },
    ],
  },
  { name: 'Partners', href: '/admin/partners', icon: Handshake },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Email Templates', href: '/admin/email-templates', icon: Mail },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  { name: 'Audit Log', href: '/admin/audit-log', icon: Shield },
];

export const publicNavigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Speakers', href: '/speakers' },
  { name: 'Partners', href: '/partners' },
  { name: 'Blog', href: '/blog' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export const dashboardNavigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Registrations', href: '/dashboard/registrations', icon: ClipboardList },
  { name: 'My Sessions', href: '/dashboard/my-sessions', icon: Calendar },
  { name: 'Certificates', href: '/dashboard/certificates', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];
