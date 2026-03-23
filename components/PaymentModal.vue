<script setup lang="ts">
  type PaymentModalProps = {
    isOpen: boolean;
    amount: number;
    name: string;
    iban: string;
    message: string;
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
      await renderToCanvas({
        name: props.name,
        iban: props.iban,
        amount: props.amount,
        message: props.message,
      });
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
        <p><span class="font-semibold">Recipient:</span> {{ name }}</p>
        <p><span class="font-semibold">IBAN:</span> {{ iban }}</p>
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
