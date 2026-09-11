<script setup lang="ts">
  import Button from '~/components/shared/Button.vue';

  withDefaults(
    defineProps<{
      backdrop?: boolean;
    }>(),
    { backdrop: true },
  );

  const showModal = defineModel<boolean>('open', { required: true });

  const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef');

  onMounted(() => {
    watch(
      showModal,
      (value) => {
        if (dialogRef.value === null) {
          console.error(
            'Dialog ref is null. Make sure the dialog is rendered before changing the open state.',
          );
          return;
        }
        if (value) dialogRef.value.showModal();
        else dialogRef.value.close();
      },
      { immediate: true },
    );
  });
</script>
<template>
  <dialog ref="dialogRef" class="modal" @close="showModal = false">
    <div class="modal-box"><slot /></div>
    <form v-if="backdrop" class="modal-backdrop" method="dialog">
      <Button>close</Button>
    </form>
  </dialog>
</template>
