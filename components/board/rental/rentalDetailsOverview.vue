<script setup lang="ts">
  const { rental } = defineProps<{
    rental: RentalDetails | PublicRentalDetails;
  }>();
</script>

<template>
  <div class="card border shadow">
    <div class="card-body">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-if="rental.member" class="flex flex-col">
          <span>Member: {{ rental.member.fullName }}</span>
          <span v-if="rental.member.email" class="ml-3">
            ✉️: <MailTo :email="rental.member.email" />
          </span>
          <span v-if="rental.member.phoneNumber" class="ml-3">
            ☎️: <WhatsappLink :phone-number="rental.member.phoneNumber" />
          </span>
        </div>
        <div v-if="rental.boardMember">
          Board member: {{ rental.boardMember }}
        </div>
        <div class="flex flex-row gap-x-1 items-center flex-wrap">
          <span>Date borrow:</span>
          <span>{{ rental.dateBorrow }}</span>
        </div>
        <div class="flex flex-row gap-x-1 items-center flex-wrap">
          <span class="w-max flex-shrink-0">Return date:</span>
          <span class="flex-[44] flex-shrink">
            <BoardRentalReturnDate :date="rental.dateReturn" />
          </span>
        </div>
        <div class="flex flex-row gap-1 items-center flex-wrap">
          <span>Deposit: {{ rental.depositFee }}</span>
          <span v-if="rental.depositReturned" class="badge badge-success">
            returned
          </span>
        </div>
        <div>Payment: {{ rental.paymentMethod }}</div>
        <div v-if="rental.status" class="flex flex-row gap-1 items-center">
          <span>Status:</span>
          <BoardRentalStatusBadge :status="rental.status" />
        </div>
      </div>
      <hr class="my-3" />
      <div class="grid grid-cols-[3fr_1fr_1fr] border rounded-sm">
        <b class="border px-1">Gear</b>
        <b class="border px-1">Amount</b>
        <b class="border px-1">Returned amount</b>
        <template
          v-for="{
            topoId: id,
            title,
            rentedAmount,
            actualAmount,
          } of rental.topos"
          :key="id">
          <div class="border p-1">{{ title }}</div>
          <div class="border p-1">{{ rentedAmount }}</div>
          <div class="border p-1">
            <span>{{ rentedAmount - actualAmount }}</span>
          </div>
        </template>
        <template
          v-for="{
            gearItemId: id,
            name,
            rentedAmount,
            actualAmount,
          } of rental.gear"
          :key="id">
          <div class="border p-1">{{ name }}</div>
          <div class="border p-1">{{ rentedAmount }}</div>
          <div class="border p-1">
            <span>{{ rentedAmount - actualAmount }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
