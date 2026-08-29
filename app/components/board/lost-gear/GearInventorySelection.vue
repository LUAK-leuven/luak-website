<script setup lang="ts">
  import InventoryTableItem from '../gear/inventoryTableItem.vue';
  import RetirementDate from '../gear/retirementDate.vue';
  import dayjs from 'dayjs';

  const props = defineProps<{
    inventory: {
      id: GearInventoryId;
      details: string;
      purchaseDate: string | undefined;
      productionDate: string | undefined;
      retirementDate: RetirementDate;
      totalAmount: number;
    }[];
    lostAmount: number | undefined;
  }>();

  const selectedItem = defineModel<GearInventoryId | undefined>({
    required: true,
  });

  const _inventory = computed(() =>
    props.inventory.filter((x) => x.totalAmount > 0),
  );

  const formatDate = (date: string | undefined): string => {
    if (date === undefined) return '';
    return dayjs(date).format('MMM YYYY');
  };
</script>

<template>
  <div
    class="grid grid-cols-[auto_4fr_1fr_2fr_2fr_2fr] border rounded-sm overflow-x-scroll"
    data-testId="inventory-selection">
    <b class="border px-1"></b>
    <b class="border px-1">Details</b>
    <b class="border px-1">Amount</b>
    <b class="border px-1">Production date</b>
    <b class="border px-1">Purchase date</b>
    <b class="border px-1">Retirement date</b>
    <label
      v-for="{
        id,
        details,
        totalAmount: amount,
        productionDate,
        purchaseDate,
        retirementDate,
      } of _inventory"
      :key="id"
      class="contents"
      :class="{ 'border-5 bg-blue-100': selectedItem === id }"
      data-testId="table-row">
      <InventoryTableItem :is-archived="false">
        <input
          v-model="selectedItem"
          class="radio radio-primary"
          type="radio"
          name="inventoryItem"
          :value="id" />
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        {{ details }}
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false" data-testId="amount">
        {{ amount }}
        <template v-if="id === selectedItem && lostAmount !== undefined">
          -> {{ amount - lostAmount }}
        </template>
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        {{ formatDate(productionDate) }}
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        {{ formatDate(purchaseDate) }}
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        <RetirementDate :retirement-date="retirementDate" />
      </InventoryTableItem>
    </label>
  </div>
</template>
