<script setup lang="ts">
  import { toCanvas } from 'qrcode';

  const canvasRef = ref<HTMLCanvasElement | null>(null);

  onMounted(async () => {
    if (!canvasRef.value) {
      return;
    }

    await toCanvas(canvasRef.value, 'Hello world!', {
      errorCorrectionLevel: 'M',
      width: 220,
      margin: 1,
    });
  });
</script>

<template>
  <FullPageCard>
    <template #title>Test</template>
    <canvas ref="canvasRef" />
  </FullPageCard>
</template>
