'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveRegistration,
  rejectRegistration,
  waitlistRegistration,
} from '@/lib/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface Registration {
  id: string;
  user_id: string;
  category: string;
  status: string;
  organization: string;
  designation: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface RegistrationTableProps {
  registrations: Registration[];
  isLoading?: boolean;
}

export function RegistrationTable({ registrations, isLoading = false }: RegistrationTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    registrationId: string | null;
    reason: string;
  }>({ isOpen: false, registrationId: null, reason: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(registrations.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApprove = useCallback(
    async (registrationId: string) => {
      setActionLoading(registrationId);
      try {
        const result = await approveRegistration(registrationId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Registration approved');
          router.refresh();
        }
      } catch (error) {
        console.error('Approval error:', error);
        toast.error('Failed to approve registration');
      } finally {
        setActionLoading(null);
      }
    },
    [router]
  );

  const handleRejectClick = (registrationId: string) => {
    setRejectDialog({
      isOpen: true,
      registrationId,
      reason: '',
    });
  };

  const handleRejectSubmit = useCallback(async () => {
    if (!rejectDialog.registrationId) return;

    if (!rejectDialog.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(rejectDialog.registrationId);
    try {
      const result = await rejectRegistration(rejectDialog.registrationId, rejectDialog.reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Registration rejected');
        setRejectDialog({ isOpen: false, registrationId: null, reason: '' });
        router.refresh();
      }
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject registration');
    } finally {
      setActionLoading(null);
    }
  }, [rejectDialog, router]);

  const handleWaitlist = useCallback(
    async (registrationId: string) => {
      setActionLoading(registrationId);
      try {
        const result = await waitlistRegistration(registrationId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Registration moved to waitlist');
          router.refresh();
        }
      } catch (error) {
        console.error('Waitlist error:', error);
        toast.error('Failed to move registration to waitlist');
      } finally {
        setActionLoading(null);
      }
    },
    [router]
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3A5C]" />
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 border border-gray-200 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No registrations found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={selectedIds.size === registrations.length && registrations.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-gray-700 font-semibold">Name</TableHead>
              <TableHead className="text-gray-700 font-semibold">Email</TableHead>
              <TableHead className="text-gray-700 font-semibold">Category</TableHead>
              <TableHead className="text-gray-700 font-semibold">Organization</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
              <TableHead className="text-gray-700 font-semibold">Date</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map(registration => (
              <TableRow
                key={registration.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <TableCell className="px-4">
                  <Checkbox
                    checked={selectedIds.has(registration.id)}
                    onCheckedChange={checked => handleSelectRow(registration.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {registration.profiles.full_name}
                </TableCell>
                <TableCell className="text-gray-600">{registration.profiles.email}</TableCell>
                <TableCell className="text-gray-600 capitalize">
                  {registration.category.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="text-gray-600 text-sm truncate max-w-xs">
                  {registration.organization}
                </TableCell>
                <TableCell>
                  <StatusBadge status={registration.status} />
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {formatDate(registration.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {registration.status !== 'approved' && (
                        <DropdownMenuItem
                          onClick={() => handleApprove(registration.id)}
                          disabled={actionLoading === registration.id}
                        >
                          Approve
                        </DropdownMenuItem>
                      )}
                      {registration.status !== 'rejected' && (
                        <DropdownMenuItem
                          onClick={() => handleRejectClick(registration.id)}
                          disabled={actionLoading === registration.id}
                        >
                          Reject
                        </DropdownMenuItem>
                      )}
                      {registration.status !== 'waitlisted' && (
                        <DropdownMenuItem
                          onClick={() => handleWaitlist(registration.id)}
                          disabled={actionLoading === registration.id}
                        >
                          Waitlist
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialog.isOpen} onOpenChange={isOpen =>
        isOpen ? null : setRejectDialog({ isOpen: false, registrationId: null, reason: '' })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this registration. This will be sent to the
              applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectDialog.reason}
              onChange={e =>
                setRejectDialog(prev => ({ ...prev, reason: e.target.value }))
              }
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialog({ isOpen: false, registrationId: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={actionLoading !== null || !rejectDialog.reason.trim()}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
