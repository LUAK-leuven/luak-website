import luakEventHandler from '#server/luakEventHandler';

export default luakEventHandler(async ({ services: { topoService } }) => {
  return await topoService().getTopos();
});
