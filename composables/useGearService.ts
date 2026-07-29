import { GearService } from '~/services/gearService';
import type { TopoId } from '~/types/gear';

const GEAR = 'gear';

type GearServiceFunctionNames = PickFunctionNames<GearService>;

export function useGearService() {
  const gearService = new GearService();

  const getData =
    <
      T extends GearServiceFunctionNames,
      R = Awaited<ReturnType<GearService[T]>>,
    >(
      functionName: T,
    ) =>
    async () => {
      const { data, pending, error } = await useLazyAsyncData(
        `${GEAR}-${functionName}`,
        async () => (await gearService[functionName]()) as R,
      );
      if (error.value) console.error(functionName, error.value);
      return {
        data,
        pending,
        error,
      };
    };

  const getTopoDetails = async (topoId: TopoId) => {
    return await useLazyFetch(`/api/topos/${topoId}`, { method: 'get' });
  };

  const getTopoLibrary = async () => {
    return await useLazyFetch(`/api/topos/library`, { method: 'get' });
  };

  return {
    getCompositeGearItems: getData('getCompositeGearItems'),
    getTopoLibrary,
    getTopoDetails,
  };
}
