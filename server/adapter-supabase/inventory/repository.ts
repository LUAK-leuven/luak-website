import type { SupabaseClient } from '@supabase/supabase-js';

import {
  foldInventoryItemEvents,
  type GearInventoryRecord,
  type GearInventorySummaryRecord,
  type GearItemRecord,
  type InventoryItemId,
} from '#server/domain/inventory/InventoryItem';
import type { InventoryRepository } from '#server/domain/inventory/repository';
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
import type { Database } from '#shared/types/database.types';
import { groupBy } from '#shared/utils/utils';

export class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getInventorySummary(): Promise<GearInventorySummaryRecord[]> {
    const inventory = await this.getInventoryRows();
    const events = await this.getAllGearInventoryItemEvents();
    const grouped = groupBy(events, (event) => event.gearInventoryId);
    return inventory.map((item) => ({
      gearItemId: item.rentalItemId,
      productionDate: item.productionDate,
      purchaseDate: item.purchaseDate,
      lifespan: item.lifespan,
      totalAmount: foldInventoryItemEvents(
        createInitialAmount(item.amount),
        grouped[item.id] ?? [],
      ),
    }));
  }

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

  async getAllGearItems(): Promise<GearItemRecord[]> {
    const { data } = await this.supabaseClient
      .from('RentalItems')
      .select('id, name, deposit_fee, Inventory(GearInventory(lifespan))')
      .eq('item_type', 'gear')
      .order('name')
      .throwOnError();
    return data.map(mapGearItem);
  }

  async getGearItem(id: GearItemId): Promise<GearItemRecord> {
    const { data } = await this.supabaseClient
      .from('RentalItems')
      .select('id, name, deposit_fee, Inventory(GearInventory(lifespan))')
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

  private async getInventoryRows() {
    const { data } = await this.supabaseClient
      .from('GearInventory')
      .select(
        'id, Inventory(rental_item_id), production_date, purchase_date, amount, lifespan',
      )
      .throwOnError();
    return data.flatMap((item) => {
      if (item.Inventory.rental_item_id === null) return [];
      return [
        {
          id: createGearInventoryId(item.id),
          rentalItemId: createGearItemId(item.Inventory.rental_item_id),
          productionDate: mapOptional(
            item.production_date,
            createProductionDate,
          ),
          purchaseDate: mapOptional(item.purchase_date, createPurchaseDate),
          amount: item.amount,
          lifespan: mapLifeSpan(item.lifespan),
        },
      ];
    });
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
