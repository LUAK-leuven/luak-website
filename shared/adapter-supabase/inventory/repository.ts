import type { SupabaseClient } from '@supabase/supabase-js';

import {
  createDetails,
  createGearInventoryId,
  createGearItemId,
  createGearName,
  createLifeSpanInYears,
  createProductionDate,
  createPurchaseDate,
  type GearItemId,
  type LifeSpanInYears,
} from '#shared/api/rest/gear';
import {
  createInitialAmount,
  createOccurredOn,
  type InventoryItemEvent,
  itemEventSchema,
} from '#shared/api/rest/inventory';
import { createDepositFee } from '#shared/api/rest/rental';
import {
  foldInventoryItemEvents,
  type GearInventoryRecord,
  type GearItemRecord,
  type InventoryItemId,
} from '#shared/domain/inventory/InventoryItem';
import type { InventoryRepository } from '#shared/domain/inventory/repository';
import type { Database } from '#shared/types/database.types';
import { groupBy } from '#shared/utils/utils';

export class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getInventoryDetails(id: GearItemId): Promise<GearInventoryRecord[]> {
    const { data } = await this.supabaseClient
      .from('Inventory')
      .select(
        'GearInventory(id, production_date, purchase_date, amount, details, lifespan)',
      )
      .eq('rental_item_id', id)
      .throwOnError();

    const events = groupBy(
      await this.getAllGearInventoryItemEvents(),
      (event) => event.gearInventoryId,
    );

    return data.map((item) => {
      if (item.GearInventory === null)
        throw new Error('Inventory item is not linked to GearInventory item');
      const id = createGearInventoryId(item.GearInventory.id);
      const itemEvents = events[id] ?? [];
      return mapGearInventoryRecord(item.GearInventory, itemEvents);
    });
  }

  async getGearItem(id: GearItemId): Promise<GearItemRecord> {
    const { data } = await this.supabaseClient
      .from('RentalItems')
      .select('id, name, deposit_fee')
      .eq('id', id)
      .single()
      .throwOnError();
    return mapGearItem(data);
  }

  async getInventoryItemEvents(
    inventoryItemId: InventoryItemId,
  ): Promise<InventoryItemEvent[]> {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_id', inventoryItemId)
      .throwOnError();
    return data.map(mapInventoryItemEvent);
  }

  async getAllGearInventoryItemEvents() {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('item_id, occured_on, event, Inventory(GearInventory(id))')
      .not('Inventory.GearInventory.id', 'is', null)
      .throwOnError();
    return data.map((item) => ({
      gearInventoryId: createGearInventoryId(item.item_id),
      ...mapInventoryItemEvent(item),
    }));
  }
}

const mapGearInventoryRecord = (
  item: {
    id: string;
    production_date: string | null;
    purchase_date: string | null;
    amount: number;
    details: string;
    lifespan: number;
  },
  itemEvents: InventoryItemEvent[],
): GearInventoryRecord => {
  const initialAmount = createInitialAmount(item.amount);
  return {
    id: createGearInventoryId(item.id),
    productionDate: mapOptional(item.production_date, createProductionDate),
    purchaseDate: mapOptional(item.purchase_date, createPurchaseDate),
    initialAmount,
    amount: foldInventoryItemEvents(initialAmount, itemEvents),
    details: createDetails(item.details),
    events: itemEvents,
    lifespan: mapLifeSpan(item.lifespan),
  };
};

const mapOptional = <T, V>(
  value: V | null,
  create: (value: V) => T,
): T | undefined => (value === null ? undefined : create(value));

export const mapInventoryItemEvent = (item: {
  occured_on: string;
  event: unknown;
}): InventoryItemEvent => ({
  occurredOn: createOccurredOn(item.occured_on),
  ...itemEventSchema.parse(item.event),
});

export const mapGearItem = (item: {
  id: string;
  name: string;
  deposit_fee: number;
}): GearItemRecord => ({
  id: createGearItemId(item.id),
  name: createGearName(item.name),
  depositFee: createDepositFee(item.deposit_fee),
});

const mapLifeSpan = (lifespan: number): LifeSpanInYears =>
  createLifeSpanInYears(lifespan === 0 ? 'infinite' : lifespan);
