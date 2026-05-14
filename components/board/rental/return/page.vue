<script setup lang="ts">
  import type { Enums } from '~/types/database.types';
  import { computeRentalStatus } from '~/utils/rental/computeStatus';
  import TextField from '~/components/input/TextField.vue';
  import { useToast } from '~/composables/useToast';
  import type { RentalDetails, RentalUpdate } from '~/types/rental';
  import RentalItem from './rentalItem.vue';
  import { useRentalReturnForm } from '~/composables/board/rental/useRentalReturnForm';
  import type { EntityId } from '~/types/ddd';

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
    rentalRentedItems: { id: T; returnedAmount: number }[],
  ) {
    return Object.entries<number>(formReturnedItems).filter(
      ([id, returnedAmount]) =>
        rentalRentedItems.find((it) => it.id === id)!.returnedAmount !==
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
        status: computedStatus.value,
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

  const computedStatus: ComputedRef<Enums<'rental_status'>> = computed(() => {
    return computeRentalStatus({
      rentedGear: Object.fromEntries(
        props.rental.gear.map((it) => [it.id, it.rentedAmount]),
      ),
      returnedGear: values.returnedGear!,
      rentedTopos: Object.fromEntries(
        props.rental.topos.map((it) => [it.id, it.rentedAmount]),
      ),
      returnedTopos: values.returnedTopos!,
      depositReturned: values.depositReturned!,
    });
  });

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
      <div v-if="rental.member" class="flex flex-col">
        <span data-testId="member.fullName">
          Member: {{ rental.member.fullName }}
        </span>
        <span v-if="rental.member.email" class="ml-3">
          ✉️:
          <SharedMailTo
            :email="rental.member.email"
            data-testId="member.email" />
        </span>
        <span v-if="rental.member.phoneNumber" class="ml-3">
          ☎️:
          <SharedWhatsappLink
            :phone-number="rental.member.phoneNumber"
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
        <BoardRentalStatusBadge :status="computedStatus" data-testId="status" />
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
      :class="'grid-cols-[3fr_auto_1fr_auto]'"
      data-testId="gear-and-topos-overview">
      <b class="border px-1">Gear</b>
      <b class="border px-1"></b>
      <b class="border px-1">Amount</b>
      <b class="border px-1" />
      <RentalItem
        v-for="{ title, rentedAmount, id } of rental.topos"
        :key="id"
        :bouncing="bouncing[`returnedTopos.${id}`]"
        :name="title"
        :rented-amount="rentedAmount"
        :returned-amount="values.returnedTopos![id]"
        :rental-id="rental.id"
        :item-id="{ type: 'topo', id }"
        @update-returned-amount="
          (amount) => updateReturnedItem({ type: 'topo', id, amount })
        " />
      <RentalItem
        v-for="{ name, rentedAmount, id } of rental.gear"
        :key="id"
        :bouncing="bouncing[`returnedGear.${id}`]"
        :name="name"
        :rented-amount="rentedAmount"
        :returned-amount="values.returnedGear![id]"
        :rental-id="rental.id"
        :item-id="{ type: 'gear', id }"
        @update-returned-amount="
          (amount) => updateReturnedItem({ type: 'gear', id, amount })
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
