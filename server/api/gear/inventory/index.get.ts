import luakEventHandler from '#server/luakEventHandler';

export default luakEventHandler(async ({ services: { inventoryService } }) => {
  return await inventoryService().getInventorySummary();
});
