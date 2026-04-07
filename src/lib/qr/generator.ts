import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#1B3A5C',
      light: '#FFFFFF',
    },
  });
}

export async function generateQRBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#1B3A5C',
      light: '#FFFFFF',
    },
  });
}
