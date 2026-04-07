'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Building2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { cancelRegistration, getRegistrationQRCode } from '@/lib/actions/registration-actions';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

interface RegistrationCardProps {
  registration: {
    id: string;
    status: string;
    category: string;
    submission_data?: { organization?: string; designation?: string };
    created_at: string;
    events: { title: string; start_date: string; venue_name: string };
  };
}

type QRCodeState = {
  id: string;
  code: string;
  qr_data_url?: string;
  is_used: boolean;
  scanned_at?: string;
};

export default function RegistrationCard({ registration }: RegistrationCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrCode, setQrCode] = useState<QRCodeState | null>(null);
  const router = useRouter();

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelRegistration(registration.id);
    if (result.success) {
      toast.success('Registration cancelled');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to cancel');
    }
    setCancelling(false);
  }

  async function handleQrDialogChange(open: boolean) {
    setQrDialogOpen(open);

    if (!open || qrCode || loadingQr) {
      return;
    }

    setLoadingQr(true);
    const result = await getRegistrationQRCode(registration.id);

    if (result.success) {
      setQrCode({
        id: result.data.id,
        code: result.data.code,
        qr_data_url: result.data.qr_data_url || undefined,
        is_used: result.data.is_used,
        scanned_at: result.data.scanned_at || undefined,
      });
    } else {
      toast.error(result.error || 'Failed to load QR code');
      setQrDialogOpen(false);
    }

    setLoadingQr(false);
  }

  const canViewQr = registration.status === 'approved' || registration.status === 'checked_in';

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{registration.events?.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(registration.events?.start_date)}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {registration.events?.venue_name}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={registration.status} />
              <Badge variant="outline">{registration.category}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {registration.submission_data?.organization} - {registration.submission_data?.designation}
            </p>
          </div>
          <div className="flex gap-2">
            {canViewQr && (
              <Dialog open={qrDialogOpen} onOpenChange={handleQrDialogChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <QrCode className="mr-1 h-4 w-4" />
                    View QR
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your Check-in QR Code</DialogTitle>
                  </DialogHeader>
                  {loadingQr && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Loading QR code...
                    </div>
                  )}
                  {!loadingQr && qrCode && (
                    <QRCodeDisplay qrCode={qrCode} registrationId={registration.id} />
                  )}
                </DialogContent>
              </Dialog>
            )}
            {registration.status === 'pending' && (
              <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
