import luakEventHandler from '~/server/luakEventHandler';

export default luakEventHandler(async ({ gearService }) => {
  return await gearService().getInventorySummary();
});
