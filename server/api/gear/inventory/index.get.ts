import luakEventHandler from '#server/luakEventHandler';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';

export default luakEventHandler<RentalItemWithAvailability[]>(
  async ({ services: { inventoryService } }) => {
    return await inventoryService().getInventorySummary();
  },
);
