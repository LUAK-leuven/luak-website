<script setup lang="ts">
  import type { RoutesNamedLocations } from '@typed-router';

  import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
  import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';

  defineProps<{
    items: RentalItemWithAvailability[];
    linkToDetails?: (id: RentalItemId) => RoutesNamedLocations;
  }>();
</script>
<template>
  <div class="max-w-[90vw]">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th>Name</th>
          <th class="px-0">Available / Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="rentalItem of items"
          :key="rentalItem.id"
          :data-testId="`rentalItem-${rentalItem.name}`">
          <td>
            <SharedLinkTo
              v-if="linkToDetails"
              :text="rentalItem.name"
              :to="linkToDetails(rentalItem.id)"
              data-testId="linkToDetails" />
            <span v-else>
              {{ rentalItem.name }}
            </span>
          </td>
          <td>
            <span data-testId="availableAmount">
              {{ rentalItem.availableAmount }}
            </span>
            /
            <span data-testId="totalAmount">
              {{ rentalItem.totalAmount }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
