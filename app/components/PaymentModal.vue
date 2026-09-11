<script setup lang="ts">
  import Modal from '~/components/shared/Modal.vue';
  import Button from '~/components/shared/Button.vue';

  import { LUAK_PAYMENT } from '~/utils/constants';
  import { EpcQrCode } from '~/model/EpcQrCode';
  import { usePaymentModal } from '~/composables/components/usePaymentModal.ts';

  const props = defineProps<{
    amount: number;
  }>();

  const { renderToCanvas } = useEpcQrCodeGenerator('canvasRef');

  const { isOpen, closePaymentModal } = usePaymentModal();

  onMounted(() => {
    watch(
      isOpen,
      async (isOpen) => {
        if (!isOpen) {
          return;
        }

        await nextTick();
        await renderToCanvas(
          new EpcQrCode({
            name: LUAK_PAYMENT.name,
            iban: LUAK_PAYMENT.iban,
            bic: LUAK_PAYMENT.bic,
            amount: props.amount,
            unstructuredReference: 'Deposit fee',
          }),
        );
      },
      { immediate: true },
    );
  });
</script>

<template>
  isOpen: {{ isOpen }}
  <Modal v-model:open="isOpen">
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
      <p>
        <span class="font-semibold">Recipient:</span> {{ LUAK_PAYMENT.name }}
      </p>
      <p><span class="font-semibold">IBAN:</span> {{ LUAK_PAYMENT.iban }}</p>
      <p><span class="font-semibold">Message:</span> Deposit fee</p>
    </div>

    <div class="modal-action">
      <Button class="btn btn-primary" type="button" @click="closePaymentModal">
        Ok
      </Button>
    </div>
  </Modal>
</template>
