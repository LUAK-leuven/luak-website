import { expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DepositFeeField from '~/components/board/rental/form/DepositFeeField.vue';

test('When text is empty the modelValue will be initialized with the computedDeposit on focus', async () => {
  const wrapper = await mountSuspended(DepositFeeField, {
    props: {
      computedDeposit: 30,
      modelValue: undefined,
      'onUpdate:modelValue': async (value: number | undefined) => {
        await wrapper.setProps({ modelValue: value });
      },
    },
  });

  expect(wrapper.props('modelValue')).toBe(undefined);

  const input = wrapper.find('input');
  await input.trigger('focus');

  expect(wrapper.props('modelValue')).toBe(30);
});

test.each([0, 10])(
  'When text is non-empty the modelValue will not be initialized with the computedDeposit on focus',
  async (modelValue: number) => {
    const wrapper = await mountSuspended(DepositFeeField, {
      props: {
        computedDeposit: 20,
        modelValue,
        'onUpdate:modelValue': async (value: number | undefined) => {
          await wrapper.setProps({ modelValue: value });
        },
      },
    });

    expect(wrapper.props('modelValue')).toBe(modelValue);

    const input = wrapper.find('input');
    await input.trigger('focus');

    expect(wrapper.props('modelValue')).toBe(modelValue);
  },
);
