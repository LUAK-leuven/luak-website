import { object as zodObject } from 'zod';

import luakEventHandler from '#server/luakEventHandler';
import { gearItemIdSchema } from '#shared/api/rest/gear';

const paramsSchema = zodObject({
  id: gearItemIdSchema,
});

export default luakEventHandler(
  async ({ services: { inventoryService }, getRouterParams }) => {
    const { id: gearItemId } = await getRouterParams(paramsSchema);

    return await inventoryService().getDetails(gearItemId);
  },
);
