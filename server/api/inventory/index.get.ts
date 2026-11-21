import { object as zodObject } from 'zod';

import luakEventHandler from '#server/luakEventHandler';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import {
  RentalItemType,
  rentalItemTypeSchema,
} from '#shared/api/rest/rental/rentalItem';

const querySchema = zodObject({
  itemType: rentalItemTypeSchema,
});

export default luakEventHandler<RentalItemWithAvailability[]>(
  async ({ services: { rentalItemRepo }, getQueryParams }) => {
    const queryParams = await getQueryParams(querySchema);

    switch (queryParams.itemType) {
      case RentalItemType.gear:
        return await rentalItemRepo().getAllRentalGearItems();
      case RentalItemType.topo:
        return await rentalItemRepo().getAllRentalTopoItems();
    }
    throw new Error(`Unsupported item type: ${queryParams.itemType}`);
  },
);
