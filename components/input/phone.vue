<template>
  <div>
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Phone Number (Whatsapp)</span>
      </div>
      <input
        v-model="phoneNumber"
        type="tel"
        ref="phoneInput"
        class="input input-bordered w-full"
      />
    </label>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import "intl-tel-input/build/css/intlTelInput.css";
import intlTelInput from "intl-tel-input";

const phoneNumber = defineModel();

onMounted(() => {
  const inputElement = document.querySelector('input[type="tel"]');
  const iti = intlTelInput(inputElement, {
    initialCountry: "BE",
    showSelectedDialCode: true,
    strictMode: true,
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@20.3.0/build/js/utils.js",
  });

  // Watch for changes
  inputElement.addEventListener("countrychange", () => {
    phoneNumber.value = iti.getNumber();
  });
});
</script>
