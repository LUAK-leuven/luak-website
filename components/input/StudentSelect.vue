<template>
  <div class="label w-full max-w-xs">
    <span class="label-text">Are you a Student?</span>
  </div>
  <Field
    name="student"
    as="select"
    class="select select-bordered w-full max-w-xs mb-2"
  >
    <option disabled selected>Choose an option...</option>
    <option value="not_student">No</option>
    <option value="student_kul">Yes, I'm a student at KUL</option>
    <option value="student_other">
      Yes, I'm a student at a different institution
    </option>
    <option value="phd_kul">I'm a phd student at KUL</option>
  </Field>
  <ErrorMessage name="student" class="text-error" />
</template>
