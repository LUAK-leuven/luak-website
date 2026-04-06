import { toCanvas } from 'qrcode';
import type { EpcQrCode } from '~/model/EpcQrCode';

export function useEpcQrCodeGenerator(templateRef: string) {
  const canvasRef = useTemplateRef<HTMLCanvasElement>(templateRef);

  const renderToCanvas = async (epcQrCode: EpcQrCode) => {
    if (!canvasRef.value) return;

    await toCanvas(canvasRef.value, epcQrCode.toString(), {
      errorCorrectionLevel: 'M',
      width: 220,
      margin: 1,
    });
  };

  return {
    renderToCanvas,
  };
}
