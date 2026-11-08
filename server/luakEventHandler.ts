import type { H3Event } from '#build/types/nitro-imports';
import { serviceBuilder } from '#server/serviceBuilder';
import { createUserId, type UserId } from '#shared/api/rest/user';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '#shared/types/database.types';
import type { ZodObject, infer as ZodInfer } from 'zod';

export default <T>(
  block: (args: {
    services: Awaited<ReturnType<typeof serviceBuilder>>;
    userId: UserId | undefined;
    getRouterParams: <T extends ZodObject>(
      zodSchema: T,
    ) => Promise<ZodInfer<T>>;
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
      getRouterParams: <T extends ZodObject>(zodSchema: T) =>
        getRouterParams(event, zodSchema),
    });
  });

const getRouterParams = async <T extends ZodObject>(
  event: H3Event,
  zodSchema: T,
): Promise<ZodInfer<T>> => {
  const result = await getValidatedRouterParams(event, (data) =>
    zodSchema.safeParse(data),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  return result.data;
};
