import type { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseInventoryRepository } from '#server/adapter-supabase/inventory/repository';
import { SupabaseRentalItemRepository } from '#server/adapter-supabase/rental/rentalItem';
import { SupabaseRentalRepository } from '#server/adapter-supabase/rental/repository';
import { SupabaseTopoRepository } from '#server/adapter-supabase/topo/repository';
import { SupabaseUserRepository } from '#server/adapter-supabase/user/repository';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { InventoryService } from '#server/domain/inventory/service';
import type { RentalItemRepository } from '#server/domain/rental/rentalItem';
import type { RentalRepository } from '#server/domain/rental/repository';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoService } from '#server/domain/topo/service';
import type { UserRepository } from '#server/domain/user/repository';
import { InventoryServiceImpl } from '#server/service/inventory';
import { TopoServiceImpl } from '#server/service/topo';
import type { Database } from '#shared/types/database.types';

export const serviceBuilder = (supabase: SupabaseClient<Database>) => {
  const inventoryRepo = useSingleton<InventoryRepository>(
    () => new SupabaseInventoryRepository(supabase),
  );
  const topoRepo = useSingleton<TopoRepository>(
    () => new SupabaseTopoRepository(supabase),
  );
  const rentalRepo = useSingleton<RentalRepository>(
    () => new SupabaseRentalRepository(supabase),
  );
  const rentalItemRepo = useSingleton<RentalItemRepository>(
    () => new SupabaseRentalItemRepository(supabase),
  );
  const userRepo = useSingleton<UserRepository>(
    () => new SupabaseUserRepository(supabase),
  );

  const topoService = useSingleton<TopoService>(
    () => new TopoServiceImpl(topoRepo(), inventoryRepo(), rentalRepo()),
  );
  const inventoryService = useSingleton<InventoryService>(
    () =>
      new InventoryServiceImpl(inventoryRepo(), rentalRepo(), rentalItemRepo()),
  );

  return {
    topoService,
    inventoryService,

    inventoryRepo,
    topoRepo,
    rentalRepo,
    rentalItemRepo,
    userRepo,
  };
};

const useSingleton = <T>(create: () => T) => {
  let instance: T | undefined = undefined;
  return () => {
    if (instance === undefined) instance = create();
    return instance;
  };
};
