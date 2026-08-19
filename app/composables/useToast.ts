export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export function useToast() {
  const toasts = useState<ToastItem[]>('luak.toast', () => []);

  const show = (type: ToastType, message: string) => {
    toasts.value.push({ id: crypto.randomUUID(), type, message });
  };

  const close = (id: string) => {
    const toastIndex = toasts.value.findIndex((toast) => toast.id === id);

    if (toastIndex === -1) {
      console.warn(`Toast with id "${id}" was not found.`);
      return;
    }

    toasts.value.splice(toastIndex, 1);
  };

  return { show, close, toasts: readonly(toasts) };
}
