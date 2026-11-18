import { mountSuspended } from '@nuxt/test-utils/runtime';
import { expect, test } from 'vitest';

import PictureDetailPage from '~/components/pages/PictureDetailPage.vue';
import { formatLongDate } from '~/utils/formatLongDate';

const doc = {
  title: 'Bouldering day',
  date: '2026-11-13T12:00:00',
  image: '/images/bouldering.jpg',
};

test('shows the title, the formatted date and a back link to the collection', async () => {
  const wrapper = await mountSuspended(PictureDetailPage, {
    props: {
      doc,
      backTo: { name: 'news' },
    },
  });

  expect(wrapper.find('h1').text()).toBe('Bouldering day');
  expect(wrapper.text()).toContain(formatLongDate(doc.date));
  expect(wrapper.find('a.btn').attributes('href')).toBe('/news');
});

test('shows the picture as the background of the card', async () => {
  const wrapper = await mountSuspended(PictureDetailPage, {
    props: {
      doc,
      backTo: { name: 'news' },
    },
  });

  expect(wrapper.find('.hero').attributes('style')).toContain(
    'url("/images/bouldering.jpg")',
  );
});

test('the meta slot adds entries after the formatted date', async () => {
  const story = {
    ...doc,
    author: 'Jane',
  };
  const wrapper = await mountSuspended(PictureDetailPage, {
    props: {
      doc: story,
      backTo: { name: 'stories' },
    },
    slots: {
      meta: '<i>By: Jane</i>',
    },
  });

  expect(wrapper.findAll('i').map((item) => item.text())).toEqual([
    formatLongDate(doc.date),
    'By: Jane',
  ]);
});
