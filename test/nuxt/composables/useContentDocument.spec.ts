import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, expect, test, vi } from 'vitest';

import { useContentDocument } from '~/composables/useContentDocument';

const { route, firstMock, pathMock, queryCollectionMock } = vi.hoisted(() => {
  const firstMock = vi.fn();
  const pathMock = vi.fn(() => ({ first: firstMock }));
  return {
    route: { path: '/news/some-article' },
    firstMock,
    pathMock,
    queryCollectionMock: vi.fn(() => ({ path: pathMock })),
  };
});

mockNuxtImport('useRoute', () => () => route);
mockNuxtImport('queryCollection', () => queryCollectionMock);

beforeEach(() => {
  vi.clearAllMocks();
});

test('useContentDocument loads the document of the current route from the collection', async () => {
  const doc = { title: 'Bouldering day' };
  firstMock.mockResolvedValue(doc);

  const loaded = await useContentDocument('news');

  expect(queryCollectionMock).toHaveBeenCalledWith('news');
  expect(pathMock).toHaveBeenCalledWith('/news/some-article');
  expect(loaded).toEqual(doc);
});

test('useContentDocument answers with a 404 when no document matches the route', async () => {
  route.path = '/stories/missing-story';
  firstMock.mockResolvedValue(null);

  await expect(useContentDocument('stories')).rejects.toMatchObject({
    statusCode: 404,
  });

  expect(queryCollectionMock).toHaveBeenCalledWith('stories');
  expect(pathMock).toHaveBeenCalledWith('/stories/missing-story');
});

test('useContentDocument surfaces a failed load instead of answering with a 404', async () => {
  route.path = '/news/broken-article';
  firstMock.mockRejectedValue(new Error('Content query failed'));

  const error = await useContentDocument('news').catch(
    (caught: unknown) => caught,
  );

  expect(error).toMatchObject({ message: 'Content query failed' });
  expect(error).not.toMatchObject({ statusCode: 404 });
});
