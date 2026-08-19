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
