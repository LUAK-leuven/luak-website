import { onClickOutside } from '@vueuse/core';

export const toggleCloseFix = (templateRef: Ref<HTMLDetailsElement | null>) => {
  const summaryElement = computed(
    () => templateRef.value?.querySelector('summary') ?? undefined,
  );

  onClickOutside(summaryElement, () => {
    closeToggle(templateRef);
  });
};

const closeToggle = (target: Ref<HTMLDetailsElement | null>) => {
  if (target.value === null) {
    console.warn(`toggleCloseFix: target is null`);
    return;
  }
  target.value.open = false;
};
