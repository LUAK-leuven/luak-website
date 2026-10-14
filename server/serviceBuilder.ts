import type { H3Event } from '#build/types/nitro-imports';
import { serverSupabaseClient } from '#supabase/server';
import { SupabaseInventoryRepository } from '#server/adapter-supabase/inventory/repository';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import { SupabaseTopoRepository } from '#server/adapter-supabase/topo/repository';
import { TopoServiceImpl } from '#server/service/topo';
import type { TopoService } from '#server/domain/topo/service';
import { SupabaseRentalRepository } from '#server/adapter-supabase/rental/repository';
import type { RentalRepository } from '#server/domain/rental/repository';
import { InventoryServiceImpl } from '#server/service/inventory';
import type { InventoryService } from '#server/domain/inventory/service';
import type { TopoRepository } from '#server/domain/topo/repository';
import { SupabaseUserRepository } from '#server/adapter-supabase/user/repository';
import type { UserRepository } from '#server/domain/user/repository';

export const serviceBuilder = async (h3Event: H3Event) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  const supabase = await serverSupabaseClient<Database>(h3Event);

  const inventoryRepo = useSingleton<InventoryRepository>(
    () => new SupabaseInventoryRepository(supabase),
  );
  const topoRepo = useSingleton<TopoRepository>(
    () => new SupabaseTopoRepository(supabase),
  );
  const rentalRepo = useSingleton<RentalRepository>(
    () => new SupabaseRentalRepository(supabase),
  );
  const userRepo = useSingleton<UserRepository>(
    () => new SupabaseUserRepository(supabase),
  );

  const topoService = useSingleton<TopoService>(
    () => new TopoServiceImpl(topoRepo(), inventoryRepo(), rentalRepo()),
  );
  const inventoryService = useSingleton<InventoryService>(
    () => new InventoryServiceImpl(inventoryRepo(), rentalRepo()),
  );

  return {
    topoService,
    inventoryService,

    inventoryRepo,
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
