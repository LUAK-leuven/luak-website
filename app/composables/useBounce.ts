export function useBounce() {
  const bouncing = ref<Record<string, boolean>>({});

  function triggerBounce(field: string) {
    bouncing.value[field] = true;
    setTimeout(() => {
      bouncing.value[field] = false;
    }, 250); // match animation duration
  }

  return { bouncing, triggerBounce };
}
