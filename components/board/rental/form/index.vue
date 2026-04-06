<script setup lang="ts">
  import type { RentalItem } from '~/types/board/form/RentalItem';
  import type { Enums } from '~/types/database.types';
  import type { GearItemId, TopoId } from '~/types/gear';
  import type { UnsavedRental } from '~/types/rental';
  import type { UserId } from '~/types/user';
  import Text from '~/components/input/Text.vue';
  import { useToast } from '~/composables/useToast';

  const props = defineProps<{
    boardMemberName: string;
    allGear: RentalItem<GearItemId>[];
    allTopos: RentalItem<TopoId>[];
    initialValues: Partial<{
      memberId: UserId | 'non-user';
      contactInfo: {
        fullName: string;
        email?: string;
        phone?: string;
      };
      dateBorrow: string;
      dateReturn: string;
      gear: Record<GearItemId, number>;
      topos: Record<TopoId, number>;
      depositFee: number;
      paymentMethod: Enums<'payment_method'>;
      markAsReserved: boolean;
      comments: string;
    }>;
    handleSubmit: (
      rentalState: Omit<UnsavedRental, 'boardMemberId'>,
    ) => Promise<{ error: string | undefined }>;
  }>();

  const { show: showPopup } = useToast();

  const { data } = await gearService().getCompositeGearItems();
  const compositeGearItems = computed(() =>
    Object.fromEntries(
      data.value?.map((it) => [
        it.name,
        it.gearItemIds.map((it) => ({ itemId: it.id, amount: it.amount })),
      ]) ?? [],
    ),
  );

  const {
    values,
    handleSubmit,
    meta,
    errors,
    selectedUser,
    userAttr,
    selectedGear,
    selectedTopos,
    dateBorrow,
    dateBorrowAttr,
    dateReturn,
    dateReturnAttr,
    depositFee,
    depositFeeAttr,
    paymentMethod,
    markAsReserved,
    comments,
    validateField,
    updateGear,
    updateTopos,
    contactInfo,
  } = useRentalForm(props.initialValues, props.allGear, props.allTopos);

  const onSubmit = handleSubmit(
    async (formState) => {
      await props.handleSubmit({
        memberId:
          formState.memberId === 'non-user' ? undefined : formState.memberId,
        dateBorrow: formState.dateBorrow,
        dateReturn: formState.dateReturn,
        gear: formState.gear,
        topos: formState.topos,
        depositFee: formState.depositFee,
        paymentMethod: formState.paymentMethod,
        contactInfo: formState.contactInfo,
        status: formState.markAsReserved ? 'reserved' : 'not_returned',
        comments: formState.comments,
      });
    },
    (ctx) => {
      showPopup('error', `${Object.values(ctx.errors)[0]}`);
    },
  );

  const computedGearDeposit = ref<number>();
  const computedTopoDeposit = ref<number>();
  const computedDeposit = computed(() => {
    const total =
      ((computedGearDeposit.value ?? 0) + (computedTopoDeposit.value ?? 0)) /
      100;
    return total > 20 ? total : 20;
  });

  onMounted(() => {
    validateField('paymentMethod');
  });
</script>

<template>
  <form @submit.prevent>
    <h2>General info</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-3">
      <div class="w-full self-end">
        <BoardRentalFormSelectMember
          v-model:user-id="selectedUser"
          v-model:full-name="contactInfo.fullName.value"
          v-model:email="contactInfo.email.value"
          v-model:phone="contactInfo.phone.value"
          :disable="props.initialValues.memberId !== undefined"
          data-testId="rental.form.memberSelect"
          v-bind="userAttr" />
      </div>

      <Text
        class="w-full"
        label="Board member *"
        :model-value="boardMemberName"
        :disabled="true"
        data-testId="rental.form.boardMember" />

      <Text
        v-model="dateBorrow"
        label="Date borrow *"
        type="date"
        data-testId="rental.form.dateBorrow"
        v-bind="dateBorrowAttr" />
      <Text
        v-model="dateReturn"
        label="Date return *"
        type="date"
        data-testId="rental.form.dateReturn"
        v-bind="dateReturnAttr" />

      <div class="flex flex-col w-fit">
        <label class="my-2" for="markAsReserved">Mark as reserved</label>
        <input
          id="markAsReserved"
          v-model="markAsReserved"
          class="toggle toggle-primary"
          type="checkbox"
          data-testId="rental.form.markAsReserved" />
      </div>

      <div class="flex flex-col w-full col-span-full">
        <span>Comments:</span>
        <textarea
          v-model="comments"
          class="textarea textarea-bordered"
          data-testId="rental.form.comments" />
      </div>
    </div>

    <hr />
    <h2>Gear list</h2>
    <BoardRentalFormItemSelection
      :selected-items="selectedGear"
      placeholder="Search gear to add ..."
      :all-items="allGear"
      :composite-items="compositeGearItems"
      @computed-deposit="(value) => (computedGearDeposit = value)"
      @set-item="(id, amount) => updateGear(id, amount)"
      @remove-item="(id) => updateGear(id, undefined)" />
    <div class="h-4"></div>
    <BoardRentalFormItemSelection
      :selected-items="selectedTopos"
      :all-items="allTopos"
      placeholder="Search topos ..."
      @computed-deposit="(value) => (computedTopoDeposit = value)"
      @set-item="(id, amount) => updateTopos(id, amount)"
      @remove-item="(id) => updateTopos(id, undefined)" />

    <hr class="mt-4" />

    <h2>Payment</h2>
    <div class="flex flex-row items-end gap-5">
      <Text
        v-model="depositFee"
        label="Deposit fee *"
        type="number"
        :placeholder="computedDeposit?.toString()"
        :auto-fill-with-placeholder="true"
        data-testId="rental.form.depositFee"
        v-bind="depositFeeAttr">
        <template #label1><span class="mr-1">€</span></template>
      </Text>
      <select
        v-model="paymentMethod"
        class="select select-bordered w-min"
        :class="errors.paymentMethod ? 'select-error border-4' : ''"
        data-testId="rental.form.paymentMethod">
        <option disabled selected>Payment method</option>
        <option value="cash">cash</option>
        <option value="transfer">transfer</option>
      </select>
    </div>

    <div class="flex justify-end">
      <SharedLoadingButton
        class="mt-3"
        :text="'Submit'"
        :disabled="!meta.dirty"
        :click-handler="onSubmit"
        data-testId="rental.form.submit" />
    </div>
  </form>

  <!-- <p>SelectedGear: {{ selectedGear }}</p> -->
  <!-- <p>Values: {{ values }}</p>
  <p>Errors: {{ errors }}</p>
  <p>Meta: {{ meta }}</p> -->
</template>
