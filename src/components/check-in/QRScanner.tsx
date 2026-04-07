'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { scanQRCode } from '@/lib/actions/checkin-actions';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  eventId: string;
  onCheckIn: () => void;
}

export default function QRScanner({ eventId, onCheckIn }: QRScannerProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; attendee?: any; category?: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [scanCount, setScanCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setResult(null);
        setCode('');
        inputRef.current?.focus();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || isPending) return;

    startTransition(async () => {
      const res = await scanQRCode(code.trim(), eventId);
      if (res.success) {
        setResult({ success: true, message: `${res.attendee?.full_name} checked in!`, attendee: res.attendee, category: res.category });
        setScanCount(prev => prev + 1);
        onCheckIn();
      } else {
        setResult({ success: false, message: res.error || 'Scan failed', attendee: res.attendee });
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleScan} className="flex gap-3">
        <div className="relative flex-1">
          <QrCode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scan QR code or enter code manually..."
            className="pl-10 text-lg h-14"
            autoFocus
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#1B3A5C] px-8 text-white hover:bg-[#152d47] disabled:opacity-50 h-14 font-medium transition-colors"
          disabled={isPending || !code.trim()}
        >
          {isPending ? 'Scanning...' : 'Check In'}
        </button>
      </form>

      <p className="text-sm text-muted-foreground">
        Scans this session: <span className="font-semibold">{scanCount}</span>
      </p>

      {result && (
        <Card className={cn('border-2 transition-all', result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')}>
          <CardContent className="flex items-center gap-4 py-6">
            {result.success ? (
              <CheckCircle2 className="h-12 w-12 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600 shrink-0" />
            )}
            <div>
              <p className={cn('text-xl font-bold', result.success ? 'text-green-800' : 'text-red-800')}>
                {result.success ? 'Check-in Successful!' : 'Check-in Failed'}
              </p>
              <p className={cn('text-lg', result.success ? 'text-green-700' : 'text-red-700')}>
                {result.message}
              </p>
              {result.category && <Badge className="mt-2" variant="secondary">{result.category}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
