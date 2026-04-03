import { toCanvas } from 'qrcode';

export type EpcQrCode = {
  name: string;
  iban: string;
  amount: number;
  message: string;
  bic?: string;
};

export function useEpcQrCodeGenerator (templateRef: string) {
  const canvasRef = useTemplateRef<HTMLCanvasElement>(templateRef);

  const renderToCanvas = async (epcQrCode: EpcQrCode) => {
    if (!canvasRef.value) return;

    const epcString = [
      'BCD',
      '001',
      '1',
      'SCT',
      epcQrCode.bic || '',
      epcQrCode.name,
      epcQrCode.iban,
      `EUR${epcQrCode.amount.toFixed(2)}`,
      'CHAR',
      '',
      epcQrCode.message,
    ].join('\n');

    await toCanvas(canvasRef.value, epcString, {
      errorCorrectionLevel: 'M',
      width: 220,
      margin: 1,
    });
  };

  return {
    renderToCanvas,
  };
}
