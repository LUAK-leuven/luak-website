<script setup lang="ts">
  import { LUAK_PAYMENT } from '~/utils/constants';
  import { EpcQrCode } from '~/model/EpcQrCode';

  type PaymentModalProps = {
    isOpen: boolean;
    amount: number;
    message?: string;
  };

  const props = defineProps<PaymentModalProps>();

  const emit = defineEmits<{
    close: [];
  }>();

  const { renderToCanvas } = useEpcQrCodeGenerator('canvasRef');

  watch(
    () => props.isOpen,
    async (isOpen) => {
      if (!isOpen) {
        return;
      }

      await nextTick();
      await renderToCanvas(new EpcQrCode({
        name: LUAK_PAYMENT.name,
        iban: LUAK_PAYMENT.iban,
        bic: LUAK_PAYMENT.bic,
        amount: props.amount,
        unstructuredReference: props.message
      }));
    },
  );

  const closeModal = () => {
    emit('close');
  };
</script>

<template>
  <div
    class="modal"
    :class="{ 'modal-open': isOpen }"
    role="dialog"
    aria-modal="true">
    <div class="modal-box max-w-md">
      <h3 class="text-lg font-bold">Payment QR Code</h3>
      <p class="py-3">
        Scan this QR code in your banking app to pay the rental deposit.
      </p>

      <div class="flex justify-center">
        <canvas ref="canvasRef" class="rounded border" />
      </div>

      <div class="mt-4 text-sm leading-6">
        <p>
          <span class="font-semibold">Amount:</span> EUR {{ amount.toFixed(2) }}
        </p>
        <p><span class="font-semibold">Recipient:</span> {{ LUAK_PAYMENT.name }}</p>
        <p><span class="font-semibold">IBAN:</span> {{ LUAK_PAYMENT.iban }}</p>
        <p><span class="font-semibold">Message:</span> {{ message }}</p>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" type="button" @click="closeModal">
          Ok
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="closeModal" />
  </div>
</template>
