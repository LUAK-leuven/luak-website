<script setup lang="ts">
  import WhatsappLink from '~/components/shared/WhatsappLink.vue';

  defineProps<{
    phoneNumber: string;
  }>();
</script>

<template>
  <WhatsappLink :phone-number="phoneNumber" />
</template>
