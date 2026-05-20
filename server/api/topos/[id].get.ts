import { object as zodObject, uuid as zodUuid } from 'zod';
import type { ZodType } from 'zod';
import luakEventHandler from '~/server/luakEventHandler';
import type { TopoId } from '~/types/gear';

const lostTopo = zodObject({
  id: zodUuid() as unknown as ZodType<TopoId>,
});

export default luakEventHandler(async ({ topoService }, event) => {
  const result = await getValidatedRouterParams(event, (data) =>
    lostTopo.safeParse(data),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  const topoDetails = await topoService().getDetails(result.data.id);

  return topoDetails;
});
