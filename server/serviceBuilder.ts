import type { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseInventoryRepository } from '#shared/adapter-supabase/inventory/repository';
import { SupabaseRentalItemRepository } from '#shared/adapter-supabase/rental/rentalItem';
import { SupabaseRentalRepository } from '#shared/adapter-supabase/rental/repository';
import { SupabaseTopoRepository } from '#shared/adapter-supabase/topo/repository';
import { SupabaseUserRepository } from '#shared/adapter-supabase/user/repository';
import type { InventoryRepository } from '#shared/domain/inventory/repository';
import type { InventoryService } from '#shared/domain/inventory/service';
import type { RentalItemRepository } from '#shared/domain/rental/rentalItem';
import type { RentalRepository } from '#shared/domain/rental/repository';
import type { TopoRepository } from '#shared/domain/topo/repository';
import type { TopoService } from '#shared/domain/topo/service';
import type { UserRepository } from '#shared/domain/user/repository';
import { InventoryServiceImpl } from '#shared/service/inventory';
import { TopoServiceImpl } from '#shared/service/topo';
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
    () => new TopoServiceImpl(topoRepo(), inventoryRepo()),
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
