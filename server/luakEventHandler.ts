import type { H3Event } from '#build/types/nitro-imports';
import { serviceBuilder } from './serviceBuilder';

export default <T>(
  block: (
    services: Awaited<ReturnType<typeof serviceBuilder>>,
    event: H3Event,
  ) => Promise<T>,
) =>
  defineEventHandler(async (event) => {
    const sb = await serviceBuilder(event);
    return await block(sb, event);
  });
