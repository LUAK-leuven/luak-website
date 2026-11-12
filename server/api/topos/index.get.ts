import luakEventHandler from '#server/luakEventHandler';

export default luakEventHandler(async ({ services: { rentalItemRepo } }) => {
  return await rentalItemRepo().getAllRentalTopoItems();
});
