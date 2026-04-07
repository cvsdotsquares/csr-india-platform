import { Badge } from '@/components/ui/badge';

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const },
  under_review: { label: 'Under Review', variant: 'info' as const },
  approved: { label: 'Approved', variant: 'success' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
  waitlisted: { label: 'Waitlisted', variant: 'secondary' as const },
  checked_in: { label: 'Checked In', variant: 'default' as const },
  cancelled: { label: 'Cancelled', variant: 'outline' as const },
  draft: { label: 'Draft', variant: 'secondary' as const },
  published: { label: 'Published', variant: 'success' as const },
  archived: { label: 'Archived', variant: 'warning' as const },
  submitted: { label: 'Submitted', variant: 'info' as const },
  withdrawn: { label: 'Withdrawn', variant: 'outline' as const },
};

export function StatusBadge({ status }: { status: string }) {
  const config =
    statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
