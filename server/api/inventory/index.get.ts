import { object as zodObject } from 'zod';

import luakEventHandler from '#server/luakEventHandler';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import { rentalItemTypeSchema } from '#shared/api/rest/rental/rentalItem';

const querySchema = zodObject({
  itemType: rentalItemTypeSchema,
});

export default luakEventHandler<RentalItemWithAvailability[]>(
  async ({ services: { inventoryService }, getQueryParams }) => {
    const queryParams = await getQueryParams(querySchema);

    return await inventoryService().getRentalItemsWithAvailability(
      queryParams.itemType,
    );
  },
);
