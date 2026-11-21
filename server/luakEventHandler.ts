import type { infer as ZodInfer, ZodType } from 'zod';

import type { H3Event } from '#build/types/nitro-imports';
import { createUserId, type UserId } from '#shared/api/rest/user';
import { serviceBuilder } from '#shared/serviceBuilder';
import type { Database } from '#shared/types/database.types';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default <T>(
  block: (args: {
    services: Awaited<ReturnType<typeof serviceBuilder>>;
    userId: UserId | undefined;
    getRouterParams: <T extends ZodType>(zodSchema: T) => Promise<ZodInfer<T>>;
    getQueryParams: <T extends ZodType>(zodSchema: T) => Promise<ZodInfer<T>>;
    event: H3Event;
  }) => Promise<T>,
) =>
  defineEventHandler(async (event) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    const supabase = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);
    const userId = user === null ? undefined : createUserId(user.sub);

    return await block({
      services: serviceBuilder(supabase),
      userId,
      getRouterParams: <T extends ZodType>(zodSchema: T) =>
        getRouterParams(event, zodSchema),
      getQueryParams: <T extends ZodType>(zodSchema: T) =>
        getQueryParams(event, zodSchema),
      event,
    });
  });

const getRouterParams = async <T extends ZodType>(
  event: H3Event,
  zodSchema: T,
): Promise<ZodInfer<T>> => {
  const result = await getValidatedRouterParams(event, (data) =>
    zodSchema.safeParse(data),
  );

  if (!result.success)
    throw createError({
      status: 404,
      message: result.error.message,
      cause: result.error,
    });

  return result.data;
};

const getQueryParams = async <T extends ZodType>(
  event: H3Event,
  zodSchema: T,
): Promise<ZodInfer<T>> => {
  const result = await getValidatedQuery(event, (data) =>
    zodSchema.safeParse(data),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: 'Invalid query parameters',
      cause: result.error,
    });

  return result.data;
};
