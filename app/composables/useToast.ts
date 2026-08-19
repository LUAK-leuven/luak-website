export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const toastDuration = 4000;

export function useToast() {
  const toasts = useState<ToastItem[]>('luak.toast', () => []);

  const show = (type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    toasts.value.push({ id, type, message });

    if (import.meta.client) {
      toastTimeouts.set(
        id,
        setTimeout(() => {
          close(id);
        }, toastDuration),
      );
    }
  };

  const close = (id: string) => {
    if (import.meta.client) {
      const timeout = toastTimeouts.get(id);

      if (timeout !== undefined) {
        clearTimeout(timeout);
        toastTimeouts.delete(id);
      }
    }

    const toastIndex = toasts.value.findIndex((toast) => toast.id === id);

    if (toastIndex === -1) {
      console.warn(`Toast with id "${id}" was not found.`);
      return;
    }

    toasts.value.splice(toastIndex, 1);
  };

  return { show, close, toasts: readonly(toasts) };
}
