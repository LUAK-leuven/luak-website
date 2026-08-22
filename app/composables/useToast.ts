export type ToastType = 'success' | 'warning' | 'error' | 'info';

export type ToastItem = {
  id: ToastId;
  type: ToastType;
  message: string;
  progress: number;
};

type ToastId = EntityId<'toast'>;

const TOAST_DURATION_MS = 5000;
const PROGRESS_TICK_MS = 100;

const toastIntervals = new Map<ToastId, ReturnType<typeof setInterval>>();
const toastRemaining = new Map<ToastId, number>();

export function useToast() {
  const toasts = useState<ToastItem[]>('luak.toast', () => []);

  const startInterval = (id: ToastId) => {
    if (!import.meta.client || toastIntervals.has(id)) return;

    const toast = toasts.value.find((item) => item.id === id);
    if (toast === undefined) return;
    if (!toastRemaining.has(id)) {
      toastRemaining.set(id, toast.progress * TOAST_DURATION_MS);
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
    if (!import.meta.client)
      throw new Error('useToast.show can only be used on the client side.');

    const id = crypto.randomUUID() as ToastId;

    toasts.value.push({ id, type, message, progress: 1 });

    toastRemaining.set(id, TOAST_DURATION_MS);
    startInterval(id);

    return id;
  };

  const close = (id: ToastId) => {
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

  const pauseToast = (id: ToastId) => {
    if (!import.meta.client) {
      return;
    }

    const interval = toastIntervals.get(id);
    if (interval !== undefined) {
      clearInterval(interval);
      toastIntervals.delete(id);
    }
  };

  const resumeToast = (id: ToastId) => {
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
