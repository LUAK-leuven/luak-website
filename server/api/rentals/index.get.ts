import luakEventHandler from '#server/luakEventHandler';
import type { RentalSummary } from '#shared/api/rest/rental';

export default luakEventHandler<RentalSummary[]>(
  async ({ rentalRepository }) => {
    const rentals = await rentalRepository().getRentals();
    return rentals.map((rental) => ({
      id: rental.id,
      memberName: rental.
      expectedReturnDate: rental.expectedReturnDate,
    }))
  },
);
