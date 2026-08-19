import { expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ToastNotification from '~/components/ToastNotification.vue';

test('emits close when the close button is clicked', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info', progress: 1 },
  });

  await wrapper.get('[data-testid="toast-close-button"]').trigger('click');

  expect(wrapper.emitted('close')).toHaveLength(1);
});

test('renders a full progress bar when progress is 1', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info', progress: 1 },
  });

  const progressBar = wrapper.get('[data-testid="toast-progress"]');

  expect(progressBar.attributes('style')).toContain('width: 100%');
});

test('renders a half-width progress bar when progress is 0.5', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info', progress: 0.5 },
  });

  expect(
    wrapper.get('[data-testid="toast-progress"]').attributes('style'),
  ).toContain('width: 50%');
});
