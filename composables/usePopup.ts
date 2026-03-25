export default function () {
  const popup = useState<
    | {
        type: 'success' | 'warning' | 'error' | 'info';
        message: string;
      }
    | undefined
  >('popup');

  const show = (
    type: 'success' | 'warning' | 'error' | 'info',
    message: string,
  ) => {
    popup.value = { type, message };
  };

  const close = () => {
    popup.value = undefined;
  };

  return { show, close, state: computed(() => popup.value) };
}
