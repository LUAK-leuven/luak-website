# Rental Payment QR Code Modal Implementation Plan

## Overview
This plan outlines the implementation of a modal that displays a QR code for rental payment in the LUAK website. The modal will use EPC (European Payments Council) QR code format to facilitate easy payment via mobile banking apps.

## Requirements
- Display a modal after successful rental submission
- Generate EPC QR code with rental payment details
- Use existing `useEpcQrCodeGenerator` composable
- Integrate with DaisyUI modal styling
- Use deposit fee from form state as payment amount

## Implementation Steps

### Step 1: Create PaymentModal Component
Create a new component `components/PaymentModal.vue` that handles the modal display and QR code rendering.

```vue
<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Payment QR Code</h3>
      <p class="py-4">Scan this QR code to pay for your rental:</p>
      <div class="flex justify-center">
        <canvas ref="canvasRef" class="border rounded"></canvas>
      </div>
      <p class="py-2 text-sm text-gray-600">
        Amount: €{{ amount.toFixed(2) }}<br>
        Recipient: {{ name }}<br>
        IBAN: {{ iban }}
      </p>
      <div class="modal-action">
        <button class="btn" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEpcQrCodeGenerator } from '~/composables/useEpcQrCodeGenerator';

const props = defineProps<{
  isOpen: boolean;
  rentalId: string;
  amount: number;
  name: string;
  iban: string;
  message: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { canvasRef, renderToCanvas } = useEpcQrCodeGenerator();

const closeModal = () => {
  emit('close');
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await renderToCanvas({
      name: props.name,
      iban: props.iban,
      amount: props.amount,
      message: props.message,
    });
  }
});
</script>
```

### Step 2: Update Rental Form Page
Modify `pages/board/rental-form.vue` to include the modal and trigger it after successful submission.

```vue
<script setup lang="ts">
  // ... existing imports
  import PaymentModal from '~/components/PaymentModal.vue';

  // ... existing code

  const showPaymentModal = ref(false);
  const paymentDetails = ref<{
    amount: number;
    name: string;
    iban: string;
    message: string;
  } | null>(null);

  async function handleSubmit(state: Omit<UnsavedRental, 'boardMemberId'>) {
    const { error, id } = await gearService().saveRental({
      ...state,
      boardMemberId: boardMember.id,
    });
    if (!error && id) {
      // Use deposit fee from form state as payment amount
      const amount = state.depositFee;
      
      paymentDetails.value = {
        amount,
        name: 'LUAK vzw', // Replace with actual recipient name
        iban: 'BE12 3456 7890 1234', // Replace with actual IBAN
        message: `Rental payment - ID: ${id}`,
      };
      
      showPaymentModal.value = true;
      showPopup('success', 'Rental saved successfully! Please complete payment.');
      return { error: undefined };
    } else {
      showPopup('error', error ?? 'An unknown error occurred.');
      return { error };
    }
  }
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <!-- ... existing template code -->

    <PaymentModal
      :is-open="showPaymentModal"
      :rental-id="paymentDetails?.message.split(' - ID: ')[1] || ''"
      :amount="paymentDetails?.amount || 0"
      :name="paymentDetails?.name || ''"
      :iban="paymentDetails?.iban || ''"
      :message="paymentDetails?.message || ''"
      @close="showPaymentModal = false"
    />
  </FullPageCard>
</template>
```

## Testing Plan
1. Test QR code generation with various amounts and details
2. Verify modal opens after successful rental submission
3. Test QR code scanning with mobile banking apps
4. Ensure modal closes properly

## Security Considerations
- Ensure IBAN and payment details are properly secured
- Use correct payment details (recipient name, IBAN) for LUAK

## Detailed Todo List

### Phase 1: Preparation and Research
- [ ] Review existing rental form page (`pages/board/rental-form.vue`) structure and handleSubmit function
- [ ] Examine `useEpcQrCodeGenerator` composable to understand API and usage
- [ ] Verify DaisyUI modal classes are available in the project
- [ ] Confirm form state structure and `depositFee` property availability
- [ ] Check existing import patterns and component structure conventions
- [ ] Review TypeScript types for `UnsavedRental` and related interfaces

### Phase 2: Component Development
- [ ] Create new file `components/PaymentModal.vue`
- [ ] Implement modal template with DaisyUI modal classes (`modal`, `modal-open`, `modal-box`)
- [ ] Add QR code canvas element with proper styling (`border rounded`)
- [ ] Create component props interface (isOpen, rentalId, amount, name, iban, message)
- [ ] Implement emit interface for close event
- [ ] Import and use `useEpcQrCodeGenerator` composable
- [ ] Add watcher to generate QR code when modal opens
- [ ] Implement closeModal function and emit close event
- [ ] Add payment details display (amount, recipient, IBAN)

### Phase 3: Integration with Rental Form
- [ ] Import PaymentModal component in `pages/board/rental-form.vue`
- [ ] Add reactive ref for `showPaymentModal` (boolean)
- [ ] Add reactive ref for `paymentDetails` object (amount, name, iban, message)
- [ ] Modify `handleSubmit` function to set payment details using `state.depositFee`
- [ ] Update success popup message to mention payment completion
- [ ] Add PaymentModal component to template with proper props binding
- [ ] Implement modal close handler (`@close="showPaymentModal = false"`)

### Phase 4: Testing and Validation
- [ ] Test QR code generation with various deposit amounts
- [ ] Verify modal opens after successful rental submission
- [ ] Test modal closes when close button is clicked
- [ ] Validate QR code renders correctly on canvas
- [ ] Test QR code scanning with mobile banking app (if possible)
- [ ] Verify payment details display correctly (amount formatting, IBAN, recipient)
- [ ] Test error handling when QR code generation fails
- [ ] Check responsive behavior on different screen sizes

### Phase 5: Code Review and Deployment
- [ ] Run ESLint and TypeScript checks on new component
- [ ] Review code for Vue 3 composition API best practices
- [ ] Verify proper error handling and edge cases
- [ ] Test integration with existing rental form workflow
- [ ] Update any relevant documentation
- [ ] Commit changes with descriptive message
- [ ] Deploy to staging environment for final testing
- [ ] Verify functionality in staging before production deployment
