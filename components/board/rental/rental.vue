<script setup lang="ts">
  import dayjs from 'dayjs';

  defineProps<{ rental: Rental }>();

  function isDateLate(date: string): boolean {
    return date < dayjs().format('YYYY-MM-DD');
  }
  function isDateClose(date: string): boolean {
    return date < dayjs().add(7, 'd').format('YYYY-MM-DD');
  }
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <div>Member: {{ rental.member }}</div>
    <div>Board member: {{ rental.boardMember }}</div>
    <div>Date borrow: {{ rental.date_borrow }}</div>
    <div>
      Return date:
      <span
        class="rounded-2xl p-1 px-2 text-nowrap"
        :class="
          isDateLate(rental.date_return)
            ? 'bg-red-300'
            : isDateClose(rental.date_return)
              ? 'bg-yellow-200'
              : ''
        ">
        {{ rental.date_return }}
      </span>
    </div>
    <div>Deposit: {{ rental.deposit_fee }} transfer</div>
    <div class="col-span-full flex flex-col gap-1">
      <div v-for="(gearItem, idx) of rental.gear" :key="idx">
        {{ gearItem.id }}: {{ gearItem.amount }}
      </div>
    </div>
  </div>
</template>
