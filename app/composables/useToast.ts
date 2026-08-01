export function useToast() {
  const toast = useState<
    | {
        type: 'success' | 'warning' | 'error' | 'info';
        message: string;
      }
    | undefined
  >('luak.toast');

  const show = (
    type: 'success' | 'warning' | 'error' | 'info',
    message: string,
  ) => {
    toast.value = { type, message };
  };

  const close = () => {
    toast.value = undefined;
  };

  return { show, close, state: readonly(toast) };
}
