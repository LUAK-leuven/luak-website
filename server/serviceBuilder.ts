import type { H3Event } from '#build/types/nitro-imports';
import { serverSupabaseClient } from '#supabase/server';
import { GearDao } from '#server/repository/gear';
import { SupabaseTopoRepository } from '#server/adapter-supabase/topo/repository';
import { TopoServiceImpl } from '#server/service/topo';
import type { TopoService } from '#server/domain/topo/service';
import { RentalDao } from '#server/repository/rentals';
import { GearService } from '#server/service/gear';
import type { TopoRepository } from '#server/domain/topo/repository';
import { SupabaseUserRepository } from '#server/adapter-supabase/user/repository';
import type { UserRepository } from '#server/domain/user/repository';

export const serviceBuilder = async (h3Event: H3Event) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  const supabase = await serverSupabaseClient<Database>(h3Event);

  const gearRepo = useSingleton(() => new GearDao(supabase));
  const topoRepo = useSingleton<TopoRepository>(
    () => new SupabaseTopoRepository(supabase),
  );
  const rentalRepo = useSingleton(() => new RentalDao(supabase));
  const userRepo = useSingleton<UserRepository>(
    () => new SupabaseUserRepository(supabase),
  );

  const topoService = useSingleton<TopoService>(
    () => new TopoServiceImpl(topoRepo(), gearRepo(), rentalRepo()),
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
    userRepo,

    supabase,
  };
};

const useSingleton = <T>(create: () => T) => {
  let instance: T | undefined = undefined;
  return () => {
    if (instance === undefined) instance = create();
    return instance;
  };
};
