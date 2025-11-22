<script setup lang="ts">
  const { error } = await checkIsBoardMember();

  const rental = ref<
    Partial<{
      boardMember: string;
      member: string;
      dateBorrowed: string;
      dateReturn: string;
      depositFee: number;
      paymentMethod: 'cash' | 'transfer';
      gearList: {
        gearId: string;
        amount: number;
      }[];
    }>
  >({});
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <!-- Error message -->
    <div v-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else>
      <details class="collapse collapse-arrow bg-base-100" open>
        <summary class="collapse-title">
          <h2 class="my-0">General info</h2>
        </summary>
        <div class="collapse-content">
          <BoardRentalGeneral v-model="rental" />
        </div>
      </details>
      <hr />
      <details class="collapse collapse-arrow bg-base-100" open>
        <summary class="collapse-title">
          <h2 class="my-0">Gear list</h2>
        </summary>
        <div class="collapse-content">
          <BoardRentalGearSelection
            v-model="rental.gearList"
            @computed-deposit-fee="(value) => (rental.depositFee = value)" />
        </div>
      </details>
      <hr />
      <details class="collapse collapse-arrow bg-base-100" open>
        <summary class="collapse-title">
          <h2 class="my-0">Payment</h2>
        </summary>
        <div class="collapse-content">
          <label class="input input-bordered flex w-full">
            <span class="label w-fit">€</span>
            <input class="" />
          </label>
          <InputText label="Deposit fee € *" name="deposit_fee" type="number" />
        </div>
      </details>

      <div class="flex justify-end">
        <!-- <button
          class="btn btn-primary mt-3 w-fit"
          :class="{ 'btn-disabled': !meta.valid || !meta.dirty }">
          Submit
        </button> -->
        <button class="btn btn-primary mt-3 w-fit">Submit</button>
        {{ rental }}
      </div>
    </div>
  </FullPageCard>
</template>
