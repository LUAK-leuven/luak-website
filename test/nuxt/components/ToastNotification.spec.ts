import { expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ToastNotification from '~/components/ToastNotification.vue';

test('emits close when the close button is clicked', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info' },
  });

  await wrapper.get('[data-testid="toast-close-button"]').trigger('click');

  expect(wrapper.emitted('close')).toHaveLength(1);
});

test('renders a running four-second progress bar by default', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info' },
  });

  const progressBar = wrapper.get('[data-testid="toast-progress"]');

  expect(progressBar.classes()).toContain('toast-progress');
  expect(progressBar.attributes('style')).toContain(
    'animation-play-state: running',
  );
});

test('pauses the progress bar when paused', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info', paused: true },
  });

  expect(
    wrapper.get('[data-testid="toast-progress"]').attributes('style'),
  ).toContain('animation-play-state: paused');
});
