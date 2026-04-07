'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeData {
  id: string;
  code: string;
  qr_data_url?: string;
  is_used: boolean;
  scanned_at?: string;
}

interface QRCodeDisplayProps {
  qrCode: QRCodeData;
  registrationId: string;
}

export function QRCodeDisplay({ qrCode, registrationId }: QRCodeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCode.code);
    toast.success('Code copied to clipboard');
  };

  const handleDownloadQR = () => {
    if (!qrCode.qr_data_url) {
      toast.error('QR code image not available');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCode.qr_data_url;
    link.download = `qr-code-${qrCode.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Check-In QR Code</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* QR Code Image */}
          {qrCode.qr_data_url && (
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <img
                src={qrCode.qr_data_url}
                alt="Check-in QR Code"
                className="w-48 h-48 border-2 border-[#1B3A5C]"
              />
            </div>
          )}

          {/* QR Code Text */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase">Code</p>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <code className="flex-1 font-mono font-semibold text-gray-900">{qrCode.code}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status */}
          {qrCode.is_used && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-medium text-green-900 uppercase mb-1">Status</p>
              <p className="text-sm text-green-800">
                Checked in on {qrCode.scanned_at ? new Date(qrCode.scanned_at).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
          )}

          {!qrCode.is_used && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 uppercase mb-1">Status</p>
              <p className="text-sm text-blue-800">Not yet checked in</p>
            </div>
          )}

          {/* Download Button */}
          <Button
            onClick={handleDownloadQR}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Present this QR code at the event check-in desk. You can save it or take a screenshot.
          </p>
        </div>
      )}
    </div>
  );
}
