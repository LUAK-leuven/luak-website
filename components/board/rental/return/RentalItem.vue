<script setup lang="ts" generic="T extends EntityId<unknown>">
  import NumberInput from '~/components/input/Number.vue';
  import type { RentalItem } from '~/model/Rental';
  import type { EntityId } from '~/types/ddd';
  import type { RentalId } from '~/types/rental';
  import getItemColor from '../getItemColor';
  import Button from '~/components/shared/Button.vue';

  const props = defineProps<{
    rentalId: RentalId;
    item: RentalItem;
    bouncing: boolean | undefined;
  }>();

  const emit = defineEmits<{
    updateReturnedAmount: [returnedAmount: number];
  }>();

  const itemStatusColor = computed(() => getItemColor(props.item));
</script>
<template>
  <div class="contents" :data-testId="`rental-item-${item.name}`">
    <div
      class="border p-1 flex flex-col items-start justify-center"
      :class="itemStatusColor">
      {{ item.name }}
      <ul v-if="item.lostAmount > 0" class="ml-5">
        <li data-testid="lostItem">{{ item.lostAmount }} item(s) Lost</li>
      </ul>
    </div>
    <div class="border p-1 flex flex-row justify-between items-center">
      <Button
        class="btn btn-circle btn-xs btn-outline"
        data-testId="quickReturn"
        @click="emit('updateReturnedAmount', item.returnableAmount)">
        <span class="material-symbols-outlined text-sm">arrow_forward</span>
      </Button>
    </div>
    <div class="border p-1 flex flex-row items-center">
      <NumberInput
        :class="{
          'animate-bounceInput': bouncing,
        }"
        :model-value="item.returnedAmount"
        :text-box-color="item.isValid() ? '' : 'input-error'"
        data-testId="returnedAmountInput"
        @update:model-value="
          (amount) => {
            if (amount !== undefined) emit('updateReturnedAmount', amount);
          }
        ">
        <template #label-end>
          <span class="m-0 w-max" data-testid="rentedAmount">
            / {{ item.returnableAmount }}
          </span>
        </template>
      </NumberInput>
    </div>
  </div>
</template>
