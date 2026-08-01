import luakEventHandler from '#server/luakEventHandler';

export default luakEventHandler(async ({ topoService }) => {
  return await topoService().getTopos();
});
