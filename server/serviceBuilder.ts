import type { H3Event } from '#build/types/nitro-imports';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/database.types';
import { GearDao } from './repository/gear';
import { TopoDao } from './repository/topos';
import { TopoService } from './service/topo';
import { RentalDao } from './repository/rentals';
import { GearService } from './service/gear';

export const serviceBuilder = async (h3Event: H3Event) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  const supabase = await serverSupabaseClient<Database>(h3Event);

  const gearRepo = useSingleton(() => new GearDao(supabase));
  const topoRepo = useSingleton(() => new TopoDao(supabase));
  const rentalRepo = useSingleton(() => new RentalDao(supabase, gearRepo()));

  const topoService = useSingleton(
    () => new TopoService(topoRepo(), gearRepo()),
  );
  const gearService = useSingleton(
    () => new GearService(gearRepo(), rentalRepo()),
  );

  return {
    topoService,
    gearService,

    gearRepo,
    topoRepo,
    rentalRepo,
  };
};

const useSingleton = <T>(create: () => T) => {
  let instance: T | undefined = undefined;
  return () => {
    if (instance === undefined) instance = create();
    return instance;
  };
};
