import { GearService } from '~~/services/gearService';

const GEAR = 'gear';

export function useGearService() {
  const gearService = new GearService();

  const getCompositeGearItems = async () => {
    const { data, pending, error } = await useLazyAsyncData(
      `${GEAR}-getCompositeGearItems`,
      async () => await gearService.getCompositeGearItems(),
    );
    if (error.value) console.error('getCompositeGearItems', error.value);
    return {
      data,
      pending,
      error,
    };
  };

  return {
    getCompositeGearItems,
  };
}
