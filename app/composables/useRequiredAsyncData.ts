import { H3Error } from 'h3';
import type { MultiWatchSources } from 'vue';

import type { Defined } from '~/utils/typeUtils';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong';

export type RequiredAsyncDataOptions = {
  watch?: MultiWatchSources;
  errorMessage?: (error: unknown) => string;
};

const createFatalLoadError = (
  cause: unknown,
  errorMessage: (error: unknown) => string,
) =>
  createError({
    statusCode: 500,
    statusMessage: errorMessage(cause),
    cause,
    fatal: true,
  });

class HandlerError extends H3Error {
  constructor(cause: unknown) {
    super('handler error', { cause });

    this.name = 'HandlerError';
  }
}

const getHandlerError = (error: Error) => {
  if (error instanceof HandlerError) {
    return error.cause;
  } else return error;
};

const runHandler = async <T>(handler: () => Promise<T>) => {
  try {
    return await handler();
  } catch (error) {
    throw new HandlerError(error);
  }
};

export async function useRequiredAsyncData<T>(
  key: string,
  handler: () => Promise<Defined<T>>,
  options: RequiredAsyncDataOptions = {},
) {
  const { watch: watchSources, errorMessage = () => DEFAULT_ERROR_MESSAGE } =
    options;

  const result = await useAsyncData(
    key,
    async () => await runHandler(handler),
    { watch: watchSources ?? [] },
  );

  if (result.status.value === 'idle') {
    await result.refresh({ cause: 'initial' });
  }

  return computed(() => {
    const error = result.error.value;
    if (error) {
      const handlerError = getHandlerError(error);
      console.error(handlerError);
      throw createFatalLoadError(handlerError, errorMessage);
    }

    const data = result.data.value;
    if (data === undefined) {
      throw createFatalLoadError(
        new Error(`Failed to load required data.`),
        errorMessage,
      );
    }
    return data;
  });
}
