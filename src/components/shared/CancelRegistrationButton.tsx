'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelRegistration } from '@/lib/actions/registration-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CancelRegistrationButtonProps {
  registrationId: string;
}

export function CancelRegistrationButton({ registrationId }: CancelRegistrationButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const result = await cancelRegistration(registrationId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Registration cancelled successfully');
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => setIsOpen(true)}
      >
        Cancel Registration
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this registration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Keep Registration
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
