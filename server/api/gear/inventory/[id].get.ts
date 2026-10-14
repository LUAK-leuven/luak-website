import { object as zodObject, uuid as zodUuid } from 'zod';
import type { ZodType } from 'zod';
import luakEventHandler from '#server/luakEventHandler';
import type { GearItemId } from '#shared/api/rest/gear';

const gearItemId = zodObject({
  id: zodUuid() as unknown as ZodType<GearItemId>,
});

export default luakEventHandler(async ({ inventoryService }, event) => {
  const { data, success, error } = await getValidatedRouterParams(
    event,
    (data) => gearItemId.safeParse(data),
  );

  if (!success)
    throw createError({
      status: 400,
      message: error.message,
      cause: error,
    });

  return await inventoryService().getDetails(data.id);
});
