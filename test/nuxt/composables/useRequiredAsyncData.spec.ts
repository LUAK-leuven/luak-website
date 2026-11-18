import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useRequiredAsyncData } from '~/composables/useRequiredAsyncData';

const failure = new Error('Database down');

const LOAD_FAILED_MESSAGE = 'Could not load the data';
const errorMessage = vi.fn(() => LOAD_FAILED_MESSAGE);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('useRequiredAsyncData returns the loaded value', async () => {
  const value = await useRequiredAsyncData('required-initial-success', () =>
    Promise.resolve({ name: 'Rope' }),
  );

  expect(value.value).toEqual({ name: 'Rope' });
});

test('useRequiredAsyncData passes the original error to errorMessage, logs it, and throws a fatal error when the handler throws', async () => {
  const x = await useRequiredAsyncData(
    'required-initial-cause',
    () => {
      throw failure;
    },
    { errorMessage },
  );
  expectCorrectErrorHandling(() => x.value, failure);
});

test('useRequiredAsyncData passes the original error to errorMessage, logs it, and throws a fatal error when the handler rejects', async () => {
  const data = await useRequiredAsyncData(
    'required-initial-cause',
    () => Promise.reject(failure),
    { errorMessage },
  );

  expectCorrectErrorHandling(() => data.value, failure);
});

test('useRequiredAsyncData updates the value when a watched source changes', async () => {
  const id = ref('first');
  const data = await useRequiredAsyncData(
    'required-refetch-success',
    () => Promise.resolve(`item-${id.value}`),
    { watch: [id] },
  );

  expect(data.value).toBe('item-first');

  id.value = 'second';

  await vi.waitFor(() => {
    expect(data.value).toBe('item-second');
  });
});

test('useRequiredAsyncData throws a fatal error and keeps no last value when a refetch fails', async () => {
  const id = ref('first');
  const data = await useRequiredAsyncData(
    `required-refetch-broken`,
    () => {
      if (id.value === 'broken') return Promise.reject(failure);
      else return Promise.resolve('success');
    },
    { watch: [id], errorMessage },
  );

  expect(data.value).toEqual('success');

  id.value = 'broken';

  await vi.waitFor(() => {
    expectCorrectErrorHandling(() => data.value, failure);
  });
});

const expectCorrectErrorHandling = (block: () => unknown, failure: unknown) => {
  expect(block).toThrow(
    createError({
      statusCode: 500,
      statusMessage: LOAD_FAILED_MESSAGE,
      cause: failure,
      fatal: true,
    }),
  );

  expect(errorMessage).toHaveBeenCalledExactlyOnceWith(failure);
  expect(console.error).toHaveBeenCalledWith(failure);
};
