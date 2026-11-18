import type { VueWrapper } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';

type ComponentConstructor = new (...args: never[]) => unknown;

export const emitFromChild = <C extends ComponentConstructor>(
  wrapper: VueWrapper<ComponentPublicInstance>,
  child: C,
  event: string,
  args: unknown[],
): VueWrapper<InstanceType<C>> => {
  const childWrapper = wrapper.findComponent(child);
  childWrapper.vm.$emit(event, ...args);
  return childWrapper;
};
