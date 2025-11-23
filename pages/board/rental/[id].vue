<script setup lang="ts">
  import ReturnDate from '~/components/board/rental/returnDate.vue';
  import type { RentalDetails } from '~/utils/gearService';

  const rental = ref<RentalDetails>();
  const loading = ref(true);
  onMounted(async () => {
    rental.value = await gearService().getRental(
      useRoute().params.id as string,
    );
    loading.value = false;
  });
</script>

<template>
  <FullPageCard>
    <template #subtitle><h2>title?</h2></template>
    <div class="h-2"></div>
    <div v-if="loading">loading ...</div>
    <div v-else-if="rental !== undefined">
      <div class="grid grid-cols-2 gap-3">
        <div>Member: {{ rental.memberName }}</div>
        <div>Board member: {{ rental.boardMember }}</div>
        <div>Date borrow: {{ rental.date_borrow }}</div>
        <ReturnDate :date="rental.date_return" />
        <div>Deposit: {{ rental.deposit_fee }}</div>
        <div>Payment: {{ rental.payment_method }}</div>
      </div>
      <hr class="my-3" />
      <div
        class="grid grid-cols-[max-content_min-content_1fr] border rounded-sm">
        <b class="border px-1">Gear</b>
        <b class="border px-1">Amount</b>
        <b class="border px-1">Returned</b>
        <template v-for="({ name, amount }, idx) of rental.gear" :key="idx">
          <div class="border p-1">{{ name }}</div>
          <div class="border p-1">{{ amount }}</div>
          <div class="border p-1">0</div>
        </template>
      </div>
      <hr class="my-3" />
      <div class="flex justify-end">
        <div class="btn btn-primary">Mark as returned</div>
      </div>
    </div>
    <div v-else>ERROR!</div>
  </FullPageCard>
</template>
