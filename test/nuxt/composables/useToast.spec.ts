import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const ToastHost = defineComponent({
  setup() {
    return useToast();
  },
  template: `
    <div>
      <button data-testid="show-success" @click="show('success', 'Success message')" />
      <button data-testid="show-error" @click="show('error', 'Error message')" />
      <button data-testid="close-first" @click="close(toasts[0]?.id ?? '')" />
      <button data-testid="close-last" @click="close(toasts[toasts.length - 1]?.id ?? '')" />
      <button data-testid="close-unknown" @click="close('unknown-id')" />
      <p data-testid="toast-count">{{ toasts.length }}</p>
      <p data-testid="toast-ids">{{ toasts.map((toast) => toast.id).join(', ') }}</p>
      <p data-testid="toast-messages">{{ toasts.map((toast) => toast.message).join(', ') }}</p>
    </div>
  `,
});

test('useToast queues multiple toasts', async () => {
  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-success"]').trigger('click');
  await wrapper.get('[data-testid="show-error"]').trigger('click');
  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('2');
  expect(wrapper.get('[data-testid="toast-messages"]').text()).toBe(
    'Success message, Error message',
  );
  const toastIds = wrapper.get('[data-testid="toast-ids"]').text().split(', ');
  expect(toastIds).toHaveLength(2);
  expect(toastIds[0]).not.toBe(toastIds[1]);

  await wrapper.get('[data-testid="close-first"]').trigger('click');
  await wrapper.get('[data-testid="close-last"]').trigger('click');
});

test('useToast closes the toast with the matching id', async () => {
  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-success"]').trigger('click');
  await wrapper.get('[data-testid="show-error"]').trigger('click');
  await wrapper.get('[data-testid="close-first"]').trigger('click');

  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('1');
  expect(wrapper.get('[data-testid="toast-messages"]').text()).toBe(
    'Error message',
  );

  await wrapper.get('[data-testid="close-last"]').trigger('click');
});

test('useToast does not close a toast with an unknown id', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-success"]').trigger('click');
  await wrapper.get('[data-testid="close-unknown"]').trigger('click');
  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('1');
  expect(warn).toHaveBeenCalledWith(
    'Toast with id "unknown-id" was not found.',
  );
  await wrapper.get('[data-testid="close-first"]').trigger('click');
  warn.mockRestore();
});

test('useToast automatically closes a toast after 4000ms', async () => {
  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-success"]').trigger('click');
  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('1');

  await vi.advanceTimersByTimeAsync(4000);

  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('0');
});

test('useToast clears the timer when a toast is closed manually', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-success"]').trigger('click');
  await wrapper.get('[data-testid="close-first"]').trigger('click');
  await vi.advanceTimersByTimeAsync(4000);

  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('0');
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test('useToast runs independent timers for each toast', async () => {
  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-success"]').trigger('click');
  await vi.advanceTimersByTimeAsync(1000);
  await wrapper.get('[data-testid="show-error"]').trigger('click');

  await vi.advanceTimersByTimeAsync(2999);
  expect(wrapper.get('[data-testid="toast-messages"]').text()).toBe(
    'Success message, Error message',
  );

  await vi.advanceTimersByTimeAsync(1);
  expect(wrapper.get('[data-testid="toast-messages"]').text()).toBe(
    'Error message',
  );

  await vi.advanceTimersByTimeAsync(3000);
  expect(wrapper.get('[data-testid="toast-count"]').text()).toBe('0');
});
