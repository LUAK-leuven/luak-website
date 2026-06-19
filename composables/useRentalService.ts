import {
  rentalDetailsFromDb,
  RentalService,
  rentalSummaryFromDb,
} from '~/services/rentalService';
import type { RentalId, RentalUpdate, UnsavedRental } from '~/types/rental';
import type {
  ExtractFunctionArguments,
  ExtractFunctionReturn,
  PickFunctionNames,
} from '~/utils/typeUtils';

const RENTAL = 'rental';

type RentalServiceNames = PickFunctionNames<RentalService>;

export function useRentalService() {
  const rentalService = new RentalService();

  const getRentalData = <T extends RentalServiceNames>(fName: T) => {
    type Fn = RentalService[T];
    return async function (...args: ExtractFunctionArguments<Fn>) {
      const { data, pending, error, refresh } = await useLazyAsyncData(
        `${RENTAL}-${fName}-${JSON.stringify(args)}`,
        async () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          return await rentalService[fName](...args);
        },
      );
      if (error.value) console.error(fName, error.value);
      return {
        rentals: data as Ref<Unwrap<ExtractFunctionReturn<Fn>> | null>,
        pending,
        refresh,
        error,
      };
    };
  };

  const getAllRentals = async () => {
    const { data, pending, error } = await useLazyAsyncData(
      `${RENTAL}-getAllRentals`,
      async () => await rentalService.getRentals(),
    );
    if (error.value) console.error('getAllRentals', error.value);
    const rentals = computed(() => {
      if (!data.value) return undefined;
      return data.value.map((rental) => rentalSummaryFromDb(rental));
    });
    return {
      rentals,
      pending,
      error,
    };
  };

  const getRental = async (rentalId: RentalId) => {
    const { data, pending, error } = await useLazyAsyncData(
      `${RENTAL}-getRental-${rentalId}`,
      async () => await rentalService.getRental(rentalId),
    );
    if (error.value) console.error(`getRental-${rentalId}`, error.value);
    const rental = computed(() => {
      if (!data.value) return undefined;
      return rentalDetailsFromDb(data.value);
    });
    return {
      rental,
      pending,
      error,
    };
  };

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
    get: getRental,
    getAllRentals,
    getForUser: getRentalData('getRentalsForUser'),
  };
}

function invalidateCaches() {
  clearNuxtData((key) => key.startsWith(RENTAL));
}
