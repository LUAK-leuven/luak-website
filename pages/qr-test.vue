<script setup lang="ts">
  const { canvasRef, renderToCanvas } = useEpcQrCodeGenerator();

  onMounted(async () => {
    renderToCanvas({
      name: 'LUAK',
      iban: 'BE03 7340 3133 8584',
      amount: 12.09,
      message: 'Deposit fee',
    });
  });
</script>

<template>
  <FullPageCard>
    <template #title>QR-Test</template>
    <canvas ref="canvasRef" />
  </FullPageCard>
</template>
