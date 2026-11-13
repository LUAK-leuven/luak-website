import type { SupabaseClient } from '@supabase/supabase-js';

import { foldInventoryItemEvents } from '#server/domain/inventory/InventoryItem';
import type {
  RentalItem,
  RentalItemRepository,
} from '#server/domain/rental/rentalItem';
import type { GearItemId } from '#shared/api/rest/gear';
import { createGearItemId } from '#shared/api/rest/gear';
import {
  createInitialAmount,
  itemEventSchema,
} from '#shared/api/rest/inventory';
import { createDepositFee } from '#shared/api/rest/rental';
import {
  createAvailableAmount,
  type RentalItemWithAvailability,
} from '#shared/api/rest/rental/availability';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import {
  createRentalItemId,
  createRentalItemName,
  createTotalAmount,
} from '#shared/api/rest/rental/rentalItem';
import type { Database, Json } from '#shared/types/database.types';
import { sum } from '#shared/utils/utils';

export class SupabaseRentalItemRepository implements RentalItemRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getAllRentalGearItems(): Promise<RentalItem<GearItemId>[]> {
    const { data } = await this.supabaseClient
      .from('RentalItems')
      .select('id, name, deposit_fee')
      .eq('item_type', 'gear')
      .order('name')
      .throwOnError();

    return data.map(mapRentalItem<GearItemId>);
  }

  async getAllRentalTopoItems(): Promise<RentalItemWithAvailability[]> {
    const { data } = await this.supabaseClient
      .from('RentalItems')
      .select(
        `
          id,
          name,
          deposit_fee,
          Inventory(Topos(amount), InventoryItemEvents(event)),
          RentedItems(rented_amount, returned_amount, lost_amount)
        `,
      )
      .eq('item_type', 'topo')
      .order('name')
      .throwOnError();

    return data.map(mapRentalItemWithAvailability);
  }
}

const mapRentalItem = <T extends RentalItemId>(item: {
  id: string;
  name: string;
  deposit_fee: number;
}): RentalItem<T> => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  id: createGearItemId(item.id) as unknown as T,
  name: createRentalItemName(item.name),
  depositFee: createDepositFee(item.deposit_fee),
});

const mapRentalItemWithAvailability = (item: {
  id: string;
  name: string;
  deposit_fee: number;
  Inventory: {
    Topos: { amount: number } | null;
    InventoryItemEvents: { event: Json }[];
  }[];
  RentedItems: {
    rented_amount: number;
    returned_amount: number;
    lost_amount: number;
  }[];
}): RentalItemWithAvailability => {
  const totalAmount = sum(item.Inventory.map(mapTopoInventoryAmount));
  const outstandingAmount = sum(item.RentedItems.map(mapOutstandingAmount));
  return {
    id: createRentalItemId(item.id),
    name: createRentalItemName(item.name),
    depositFee: createDepositFee(item.deposit_fee),
    availableAmount: createAvailableAmount(totalAmount - outstandingAmount),
    totalAmount: createTotalAmount(totalAmount),
  };
};

const mapTopoInventoryAmount = (inventoryItem: {
  Topos: { amount: number } | null;
  InventoryItemEvents: { event: Json }[];
}) =>
  foldInventoryItemEvents(
    createInitialAmount(inventoryItem.Topos!.amount),
    inventoryItem.InventoryItemEvents.map(({ event }) =>
      itemEventSchema.parse(event),
    ),
  );

const mapOutstandingAmount = (rentedItem: {
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
}) =>
  rentedItem.rented_amount -
  rentedItem.returned_amount -
  rentedItem.lost_amount;
