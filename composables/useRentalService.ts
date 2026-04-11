import {
  type RentalService,
  rentalService,
} from '~/utils/services/rentalService';
import type { RentalId, RentalUpdate, UnsavedRental } from '~/types/rental';
import type {
  ExtractFunctionArguments,
  ExtractFunctionReturn,
  PickFunctionNames,
} from '~/utils/typeUtils';

const RENTAL = 'rental';

function invalidateCaches() {
  clearNuxtData((key) => key.startsWith(RENTAL));
}

export function useRentalService() {
  const service = rentalService();

  function getRentalData<T extends PickFunctionNames<RentalService>>(fName: T) {
    return async function (
      ...args: ExtractFunctionArguments<RentalService[T]>
    ): Promise<{
      rentals: Ref<Unwrap<ExtractFunctionReturn<RentalService[T]>> | null>;
      pending: Ref<boolean>;
    }> {
      const { data, pending, error } = await useAsyncData(
        `${RENTAL}-${fName}`,
        async () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          return await service[fName](...args);
        },
        { lazy: true,  },
      );
      if (error.value) console.error(fName, error.value);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return { rentals: data, pending };
    };
  }

  async function save(rental: UnsavedRental) {
    const { id, error } = await service.saveRental(rental);
    invalidateCaches();
    return { id, error };
  }

  async function edit(
    id: RentalId,
    rental: Omit<Omit<UnsavedRental, 'memberId'>, 'boardMemberId'>,
  ) {
    const { error } = await service.editRental(id, rental);
    invalidateCaches();
    return { error };
  }

  async function update(id: RentalId, rental: Omit<RentalUpdate, 'id'>) {
    const { error } = await service.updateRental(id, rental);
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
