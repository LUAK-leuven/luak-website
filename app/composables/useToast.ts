export type ToastType = 'success' | 'warning' | 'error' | 'info';

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  progress: number;
};

const TOAST_DURATION_MS = 5000;
const PROGRESS_TICK_MS = 100;

const toastIntervals = new Map<string, ReturnType<typeof setInterval>>();
const toastRemaining = new Map<string, number>();

export function useToast() {
  const toasts = useState<ToastItem[]>('luak.toast', () => []);

  const startInterval = (id: string) => {
    if (!import.meta.client || toastIntervals.has(id)) {
      return;
    }

    toastIntervals.set(
      id,
      setInterval(() => {
        const remaining = Math.max(
          0,
          (toastRemaining.get(id) ?? 0) - PROGRESS_TICK_MS,
        );
        const toast = toasts.value.find((item) => item.id === id);

        toastRemaining.set(id, remaining);
        if (toast !== undefined) {
          toast.progress = remaining / TOAST_DURATION_MS;
        }

        if (remaining === 0) {
          close(id);
        }
      }, PROGRESS_TICK_MS),
    );
  };

  const show = (type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    toasts.value.push({ id, type, message, progress: 1 });

    if (import.meta.client) {
      toastRemaining.set(id, TOAST_DURATION_MS);
      startInterval(id);
    }
  };

  const close = (id: string) => {
    if (import.meta.client) {
      const interval = toastIntervals.get(id);

      if (interval !== undefined) {
        clearInterval(interval);
        toastIntervals.delete(id);
      }
      toastRemaining.delete(id);
    }

    const toastIndex = toasts.value.findIndex((toast) => toast.id === id);

    if (toastIndex === -1) {
      console.warn(`Toast with id "${id}" was not found.`);
      return;
    }

    toasts.value.splice(toastIndex, 1);
  };

  const pauseToast = (id: string) => {
    if (!import.meta.client) {
      return;
    }

    const interval = toastIntervals.get(id);
    if (interval !== undefined) {
      clearInterval(interval);
      toastIntervals.delete(id);
    }
  };

  const resumeToast = (id: string) => {
    if (toasts.value.some((toast) => toast.id === id)) {
      startInterval(id);
    }
  };

  return {
    show,
    close,
    pauseToast,
    resumeToast,
    toasts: readonly(toasts),
  };
}
