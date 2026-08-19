import { defineComponent } from 'vue';
import { expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ToastNotification from '~/components/ToastNotification.vue';
import { useToast } from '~/composables/useToast';

test('emits close when the close button is clicked', async () => {
  const wrapper = await mountSuspended(ToastNotification, {
    props: { type: 'info' },
  });

  await wrapper.get('[data-testid="toast-close-button"]').trigger('click');

  expect(wrapper.emitted('close')).toHaveLength(1);
});

test('useToast show sets and close clears the toast state', async () => {
  const ToastHost = defineComponent({
    setup() {
      return useToast();
    },
    template: `
      <div>
        <button data-testid="show-toast" @click="show('success', 'Toast message')" />
        <button data-testid="close-toast" @click="close" />
        <p data-testid="toast-state">{{ state?.type }}: {{ state?.message }}</p>
      </div>
    `,
  });

  const wrapper = await mountSuspended(ToastHost);

  await wrapper.get('[data-testid="show-toast"]').trigger('click');
  expect(wrapper.get('[data-testid="toast-state"]').text()).toBe(
    'success: Toast message',
  );

  await wrapper.get('[data-testid="close-toast"]').trigger('click');
  expect(wrapper.get('[data-testid="toast-state"]').text()).toBe(':');
});
