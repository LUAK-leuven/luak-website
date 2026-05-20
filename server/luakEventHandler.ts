import type { H3Event } from '#build/types/nitro-imports';
import { serviceBuilder } from './serviceBuilder';

export default <T>(
  block: (
    services: Awaited<ReturnType<typeof serviceBuilder>>,
    event: H3Event,
  ) => T,
) =>
  defineEventHandler(async (event) => {
    const sb = await serviceBuilder(event);
    return block(sb, event);
  });
