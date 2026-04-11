import { rentalService } from '~/services/rentalService';
import type { RentalId, RentalUpdate, UnsavedRental } from '~/types/rental';
import type {
  ExtractFunctionArguments,
  ExtractFunctionReturn,
  PickFunctionNames,
} from '~/utils/typeUtils';

const RENTAL = 'rental';

type RentalServiceNames = PickFunctionNames<typeof rentalService>;

function invalidateCaches() {
  clearNuxtData((key) => key.startsWith(RENTAL));
}

export function useRentalService() {
  function getRentalData<T extends RentalServiceNames>(fName: T) {
    type Fn = (typeof rentalService)[T];
    return async function (...args: ExtractFunctionArguments<Fn>) {
      const { data, pending, error, refresh } = await useAsyncData(
        `${RENTAL}-${fName}`,
        async () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          return await rentalService[fName](...args);
        },
        { lazy: true },
      );
      if (error.value) console.error(fName, error.value);
      return {
        rentals: data as Ref<Unwrap<ExtractFunctionReturn<Fn>> | null>,
        pending,
        refresh,
      };
    };
  }

  async function save(rental: UnsavedRental) {
    const { id, error } = await rentalService.saveRental(rental);
    invalidateCaches();
    return { id, error };
  }

  async function edit(
    id: RentalId,
    rental: Omit<Omit<UnsavedRental, 'memberId'>, 'boardMemberId'>,
  ) {
    const { error } = await rentalService.editRental(id, rental);
    invalidateCaches();
    return { error };
  }

  async function update(id: RentalId, rental: Omit<RentalUpdate, 'id'>) {
    const { error } = await rentalService.updateRental(id, rental);
    invalidateCaches();
    return { error };
  }

  return {
    save,
    edit,
    update,
    get: getRentalData('getRental'),
    getAll: getRentalData('getRentals'),
    getForUser: getRentalData('getRentalsForUser'),
  };
}
