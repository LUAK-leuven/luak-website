import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const toastTimeout = 5000;
const toastProgress = (timeMs: number) => 1 - timeMs / toastTimeout;

beforeEach(() => {
  vi.useFakeTimers();
  clearNuxtState('luak.toast', { reset: true });
});

afterEach(() => {
  vi.useRealTimers();
});

test('useToast queues multiple toasts', () => {
  const { toasts, show } = useToast();

  show('success', 'same message');
  show('success', 'same message');

  expect(toasts.value).toHaveLength(2);
  expect(toasts.value[0]!.id).not.toBe(toasts.value[1]!.id);
});

test('useToast closes the toast with the matching id', () => {
  const { show, close, toasts } = useToast();

  const id1 = show('error', 'toast 1');
  const id2 = show('warning', 'toast 2');
  const id3 = show('info', 'hey');
  expect(toasts.value).toHaveLength(3);

  close(id2);

  expect(toasts.value).toHaveLength(2);
  expect(toasts.value[0]!.id).toBe(id1);
  expect(toasts.value[1]!.id).toBe(id3);
});

test('useToast does not close a toast with an unknown id', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const { close, show, toasts } = useToast();
  show('error', 'hi there');

  const unknownId = crypto.randomUUID();
  // @ts-expect-error ToastId is not exposed, but it's just a string so doesn't matter
  close(unknownId);

  expect(toasts.value).toHaveLength(1);
  expect(warn).toHaveBeenCalledWith(
    `Toast with id "${unknownId}" was not found.`,
  );

  warn.mockRestore();
});

test(`useToast automatically closes a toast after ${toastTimeout.toFixed()}ms`, async () => {
  const { show, toasts } = useToast();

  show('info', 'tttttoaaaaast 🫨');

  await vi.advanceTimersByTimeAsync(toastTimeout);

  expect(toasts.value).toHaveLength(0);
});

test('useToast exposes timed progress', async () => {
  const { show, toasts } = useToast();

  show('success', 'abc');

  expect(toasts.value[0]?.progress).toBe(1);

  await vi.advanceTimersByTimeAsync(toastTimeout / 2);
  expect(toasts.value[0]?.progress).toBe(0.5);
});

test('useToast clears the timer when a toast is closed manually', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const { show, close, toasts } = useToast();

  const id = show('info', 'another toast');
  await vi.advanceTimersByTimeAsync(toastTimeout / 3);
  close(id);

  expect(toasts.value).toHaveLength(0);

  await vi.advanceTimersByTimeAsync(toastTimeout);

  expect(warn).not.toHaveBeenCalled();

  warn.mockRestore();
});

test('useToast runs independent timers for each toast', async () => {
  const { show, toasts } = useToast();

  show('error', 'toast 1');
  await vi.advanceTimersByTimeAsync(1000);
  show('info', 'toast 2');

  await vi.advanceTimersByTimeAsync(1000);
  expect(toasts.value[0]?.progress).toBe(toastProgress(2000));
  expect(toasts.value[1]?.progress).toBe(toastProgress(1000));

  await vi.advanceTimersByTimeAsync(toastTimeout - 2000);
  expect(toasts.value).toHaveLength(1);

  await vi.advanceTimersByTimeAsync(3000);
  expect(toasts.value).toHaveLength(0);
});

test('useToast pauses a toast without changing its progress, and resumes', async () => {
  const { show, pauseToast, resumeToast, toasts } = useToast();

  const id1 = show('warning', 'toast 1');
  show('error', 'toast 2');

  pauseToast(id1);
  await vi.advanceTimersByTimeAsync(1000);

  expect(toasts.value[0]?.progress).toBe(toastProgress(0));
  expect(toasts.value[1]?.progress).toBe(toastProgress(1000));

  resumeToast(id1);
  await vi.advanceTimersByTimeAsync(2000);

  expect(toasts.value[0]?.progress).toBe(toastProgress(2000));
});

test('useToast clears paused toast bookkeeping when dismissed', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const { show, pauseToast, close, toasts } = useToast();
  const id = show('warning', 'hellooooo');

  pauseToast(id);
  close(id);

  expect(toasts.value).toHaveLength(0);

  await vi.advanceTimersByTimeAsync(toastTimeout);
  expect(warn).not.toHaveBeenCalled();

  warn.mockRestore();
});
