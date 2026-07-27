<script setup lang="ts">
  import TextField from '~/components/input/TextField.vue';
  import { useToast } from '~/composables/useToast';
  import type { RentalUpdate } from '~/types/rental';
  import RentalItem from '~/components/board/rental/return/RentalItem.vue';
  import { useRentalReturnForm } from '~/composables/board/rental/useRentalReturnForm';
  import type { EntityId } from '~/types/ddd';
  import type {
    RentalDetails,
    RentalItem as RentalItemModel,
  } from '~/model/Rental';

  const props = defineProps<{
    rental: RentalDetails;
    update: (rental: RentalUpdate) => Promise<boolean>;
  }>();

  const { show: showPopup } = useToast();

  const { handleSubmit, values, updateReturnedItem } = useRentalReturnForm(
    props.rental,
  );

  const { bouncing, triggerBounce } = useBounce();

  function mapFormRentedItems<T extends EntityId<unknown>>(
    formReturnedItems: Record<T, number>,
    rentalRentedItems: RentalItemModel[],
  ) {
    return Object.entries<number>(formReturnedItems).filter(
      ([id, returnedAmount]) =>
        rentalRentedItems.find((it) => it.itemId.id === id)!.returnedAmount !==
        returnedAmount,
    ) as [T, number][];
  }

  const save = handleSubmit(
    async (formState) => {
      const updatedReturnedGear = mapFormRentedItems(
        formState.returnedGear,
        props.rental.gear,
      ).map(([gear_item_id, returned_amount]) => ({
        gear_item_id,
        returned_amount,
      }));

      const updatedReturnedTopos = mapFormRentedItems(
        formState.returnedTopos,
        props.rental.topos,
      ).map(([topo_id, returned_amount]) => ({
        topo_id,
        returned_amount,
      }));

      const success = await props.update({
        id: props.rental.id,
        dateReturn: formState.dateReturn,
        depositReturned: formState.depositReturned,
        gear: updatedReturnedGear,
        topos: updatedReturnedTopos,
        comments: formState.comments,
      });

      if (success) {
        showPopup('success', 'Your changes have been saved.');
        await exitReturn();
      } else {
        showPopup('error', 'Failed to save changes');
      }
    },
    (result) => {
      for (const field in result.errors) {
        triggerBounce(field);
      }
    },
  );

  const updatedRental = computed(() =>
    props.rental.copy({
      dateReturn: values.dateReturn ?? props.rental.dateReturn,
      depositReturned: values.depositReturned ?? props.rental.depositReturned,
      gear: props.rental.gear.map((g) =>
        g.copy({
          returnedAmount:
            values.returnedGear?.[g.itemId.id] ?? g.returnedAmount,
        }),
      ),
      topos: props.rental.topos.map((t) =>
        t.copy({
          returnedAmount:
            values.returnedTopos?.[t.itemId.id] ?? t.returnedAmount,
        }),
      ),
      comments: values.comments ?? props.rental.comments,
    }),
  );

  async function exitReturn() {
    await navigateTo({
      name: 'board-rentals-id',
      params: { id: props.rental.id },
    });
  }
</script>

<template>
  <form @submit.prevent>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col">
        <span data-testId="member.fullName">
          Member: {{ rental.contactInfo.fullName }}
        </span>
        <span v-if="rental.contactInfo.email" class="ml-3">
          ✉️:
          <SharedMailTo
            :email="rental.contactInfo.email"
            data-testId="member.email" />
        </span>
        <span v-if="rental.contactInfo.phoneNumber" class="ml-3">
          ☎️:
          <SharedWhatsappLink
            :phone-number="rental.contactInfo.phoneNumber"
            data-testId="member.phone" />
        </span>
      </div>
      <div v-if="rental.boardMember" data-testId="boardMember">
        Board member: {{ rental.boardMember }}
      </div>
      <div class="flex flex-row gap-x-1 items-center flex-wrap">
        <span>Date borrow:</span>
        <span data-testId="dateBorrow">{{ rental.dateBorrow }}</span>
      </div>
      <div class="flex flex-row gap-x-1 items-center flex-wrap">
        <span class="w-max flex-shrink-0">Return date:</span>
        <span class="flex-[44] flex-shrink">
          <TextField
            name="dateReturn"
            type="date"
            data-testId="editDateReturn" />
        </span>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <span>Deposit:</span>
        <span data-testId="depositFee">{{ rental.depositFee.toFixed(2) }}</span>
        <Field
          class="checkbox checkbox-success border-2 ml-1"
          name="depositReturned"
          type="checkbox"
          :value="true"
          data-testId="depositReturned" />
      </div>
      <div data-testId="paymentMethod">Payment: {{ rental.paymentMethod }}</div>
      <div class="flex flex-row gap-1 items-center">
        <span>Status:</span>
        <BoardRentalStatusBadge
          :status="updatedRental.status"
          data-testId="status" />
      </div>
      <div class="col-span-full flex flex-col">
        <span>Comments:</span>
        <Field v-slot="{ field }" name="comments">
          <textarea
            class="textarea textarea-bordered"
            data-testId="editComments"
            v-bind="field" />
        </Field>
      </div>
    </div>
    <hr class="my-3" />
    <div
      class="border rounded-sm grid"
      :class="'grid-cols-[3fr_auto_1fr]'"
      data-testId="gear-and-topos-overview">
      <b class="border px-1">Gear</b>
      <b class="border px-1"></b>
      <b class="border px-1">Amount</b>
      <RentalItem
        v-for="gearItem of updatedRental.gear"
        :key="gearItem.itemId.id"
        :rental-id="rental.id"
        :bouncing="bouncing[`returnedGear.${gearItem.itemId.id}`]"
        :item="gearItem"
        @update-returned-amount="
          (amount) =>
            updateReturnedItem({ type: 'gear', id: gearItem.itemId.id, amount })
        " />
      <RentalItem
        v-for="topoItem of updatedRental.topos"
        :key="topoItem.itemId.id"
        :bouncing="bouncing[`returnedTopos.${topoItem.itemId.id}`]"
        :item="topoItem"
        :rental-id="rental.id"
        @update-returned-amount="
          (amount) =>
            updateReturnedItem({ type: 'topo', id: topoItem.itemId.id, amount })
        " />
    </div>
    <hr class="my-3" />
    <div class="flex justify-end gap-3">
      <button class="btn btn-error btn-outline" @click="exitReturn">
        Cancel
      </button>
      <SharedLoadingButton
        text="Save changes"
        :click-handler="save"
        data-testId="saveButton" />
    </div>
  </form>
</template>
