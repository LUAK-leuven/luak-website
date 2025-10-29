<template>
  <div class="label w-full max-w-xs">
    <span class="label-text">Are you member of KBF?</span>
    <span class="label-text-alt">
      <div
        class="tooltip"
        data-tip="Only a luak membership is not enough to climb Belgian rock! You also need a KBF membership (or any other UIAA club). When you're main kbf club is LUAK you get 5€ discount"
      >
        <span class="material-symbols-outlined"> info </span>
      </div>
    </span>
  </div>
  <Field
    class="select select-bordered w-full max-w-xs mb-2"
    name="kbf_uiaa_member"
    as="select"
  >
    <option disabled selected>Choose an option...</option>
    <option value="not">No</option>
    <option value="kbf_luak">Yes, under LUAK as club</option>
    <option value="kbf_other">Yes, under a different club</option>
    <option value="uiaa">No, I'm member of a different UIAA club</option>
  </Field>
  <ErrorMessage class="text-error" name="kbf_uiaa_member" />
</template>
