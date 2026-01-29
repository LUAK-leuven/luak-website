<script setup lang="ts">
  const props = defineProps<{
    phoneNumber: string;
  }>();

  function cleanPhoneNumber(phoneNumber: string): string | undefined {
    phoneNumber = phoneNumber.trim();

    // Phone number cannot contain text
    if (phoneNumber.length < 3 || phoneNumber.match(/[a-zA-Z]/) !== null)
      return undefined;

    if (!hasPrefix(phoneNumber)) {
      phoneNumber = '+32 '.concat(phoneNumber); // Add belgium prefix
    }
    phoneNumber = removeLeadingZeroAfterPrefix(phoneNumber);

    phoneNumber = phoneNumber
      .replaceAll(/\D/g, '') // Remove all non-digit characters
      .replace(/^0*/, ''); // Remove leading zeros;

    // Max length of a phone number is 15 digits
    if (phoneNumber.length > 15) return undefined;

    return phoneNumber;
  }

  function hasPrefix(phoneNumber: string) {
    return (
      phoneNumber.match(/^(\+|00)\d{2,3}/) !== null ||
      phoneNumber.match(/^(\+|00)?\d{2,3}\s?\(0\)/) !== null
    );
  }

  function removeLeadingZeroAfterPrefix(phoneNumber: string): string {
    // example: +32 04... => +32 4...
    return phoneNumber
      .replace(/(?<=^(\+|00)\d{2,3}\s)0/, '')
      .replace(/(?<=^(\+|00)\d{2}\s?)0/, '') // If no whitespace after prefix, restrict to prefix with only 2 digits
      .replace('(0)', '');
  }

  const cleanedPhoneNumber = computed(() =>
    cleanPhoneNumber(props.phoneNumber),
  );
</script>

<template>
  <a :href="`https://wa.me/${cleanedPhoneNumber}`">
    {{ phoneNumber }}
  </a>
</template>
