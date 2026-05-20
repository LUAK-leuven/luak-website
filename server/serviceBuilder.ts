import type { H3Event } from '#build/types/nitro-imports';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/database.types';
import { GearDao } from './repository/gear';
import { TopoDao } from './repository/topos';
import { TopoService } from './service/topo';

export const serviceBuilder = async (h3Event: H3Event) => {
  const supabase = await serverSupabaseClient<Database>(h3Event);

  const gearRepo = useSingleton(() => new GearDao(supabase));
  const topoRepo = useSingleton(() => new TopoDao(supabase));

  const topoService = useSingleton(
    () => new TopoService(topoRepo(), gearRepo()),
  );

  return {
    topoService,
    gearRepo,
    topoRepo,
  };
};

const useSingleton = <T>(create: () => T) => {
  let instance: T | undefined = undefined;
  return () => {
    if (instance === undefined) instance = create();
    return instance;
  };
};
