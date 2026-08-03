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
      totalAmount: number;
    }[];
    lifespan: number;
    lostAmount: number | undefined;
  }>();

  const model = defineModel<string | undefined>({ required: true });

  const _inventory = computed(() =>
    props.inventory
      .filter((x) => x.totalAmount > 0)
      .map((x) => {
        const productionDate = x.productionDate
          ? dayjs(x.productionDate)
          : undefined;
        const purchaseDate = x.purchaseDate ? dayjs(x.purchaseDate) : undefined;
        const startDate =
          purchaseDate !== undefined
            ? purchaseDate
            : productionDate !== undefined
              ? productionDate.add(1, 'year')
              : undefined;
        return {
          id: x.id,
          details: x.details,
          amount: x.totalAmount,
          purchaseDate,
          productionDate,
          retirementDate: startDate?.add(props.lifespan, 'years'),
        };
      }),
  );
</script>

<template>
  <div
    class="grid grid-cols-[auto_4fr_1fr_2fr_2fr_2fr] border rounded-sm overflow-x-scroll"
    data-testid="inventory-selection">
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
        amount,
        productionDate,
        purchaseDate,
        retirementDate,
      } of _inventory"
      :key="id"
      class="contents"
      :class="{ 'border-5 bg-blue-100': model === id }"
      data-testid="table-row">
      <InventoryTableItem :is-archived="false">
        <input
          v-model="model"
          class="radio radio-primary"
          type="radio"
          name="inventoryItem"
          :value="id" />
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        {{ details }}
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false" data-testid="amount">
        {{ amount }}
        <template v-if="id === model && lostAmount !== undefined">
          -> {{ amount - lostAmount }}
        </template>
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        {{ dayjs(productionDate)?.format('MMM YYYY') }}
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        {{ purchaseDate?.format('MMM YYYY') }}
      </InventoryTableItem>
      <InventoryTableItem :is-archived="false">
        <RetirementDate :retirement-date="retirementDate" />
      </InventoryTableItem>
    </label>
  </div>
</template>
