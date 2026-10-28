import { object as zodObject } from 'zod';
import luakEventHandler from '#server/luakEventHandler';
import { gearItemIdSchema } from '#shared/api/rest/gear';

const gearItemId = zodObject({
  id: gearItemIdSchema,
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
