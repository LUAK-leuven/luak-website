import { toCanvas } from 'qrcode';

export type EpcQrCode = {
  name: string;
  iban: string;
  amount: number;
  message: string;
  bic?: string;
};

export default function () {
  const canvasRef = ref<HTMLCanvasElement | null>(null);

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
    canvasRef,
    renderToCanvas,
  };
}
