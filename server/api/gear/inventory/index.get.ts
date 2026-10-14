import luakEventHandler from '#server/luakEventHandler';

export default luakEventHandler(async ({ inventoryService }) => {
  return await inventoryService().getInventorySummary();
});
