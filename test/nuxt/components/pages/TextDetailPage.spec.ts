import { mountSuspended } from '@nuxt/test-utils/runtime';
import { expect, test } from 'vitest';

import TextDetailPage from '~/components/pages/TextDetailPage.vue';

test('shows the title of the document', async () => {
  const doc = { title: 'Climbing in Leuven' };

  const wrapper = await mountSuspended(TextDetailPage, {
    props: { doc },
  });

  expect(wrapper.find('h1').text()).toBe('Climbing in Leuven');
});
