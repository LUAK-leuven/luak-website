import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#shared/types/database.types';
import {
  createGearInventoryId,
  createGearItemId,
  createGearName,
  type GearItemId,
} from '#shared/api/rest/gear';
import {
  foldInventoryItemEvents,
  type GearInventoryRecord,
  type GearInventorySummaryRecord,
  type GearItemRecord,
  type InventoryItemId,
} from '#server/domain/inventory/InventoryItem';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import {
  itemEventSchema,
  type InventoryItemEvent,
} from '#shared/api/rest/inventory';

export class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getInventorySummary(): Promise<GearInventorySummaryRecord[]> {
    const inventory = await this.getInventoryRows();
    const events = await this.getAllGearInventoryItemEvents();
    const grouped = groupBy(events, (event) => event.gearInventoryId);
    return inventory.map((item) => ({
      gearItemId: item.gearItemId,
      productionDate: item.productionDate,
      purchaseDate: item.purchaseDate,
      totalAmount: foldInventoryItemEvents(item.amount, grouped[item.id] ?? []),
    }));
  }

  async getInventoryDetails(id: GearItemId): Promise<GearInventoryRecord[]> {
    const { data } = await this.supabaseClient
      .from('GearInventory')
      .select('id, production_date, purchase_date, amount, details')
      .eq('gear_item_id', id)
      .throwOnError();
    const events = groupBy(
      await this.getAllGearInventoryItemEvents(),
      (event) => event.gearInventoryId,
    );
    return data.map((item) => {
      const id = createGearInventoryId(item.id);
      const itemEvents = events[id] ?? [];
      return {
        id,
        productionDate: item.production_date ?? undefined,
        purchaseDate: item.purchase_date ?? undefined,
        initialAmount: item.amount,
        totalAmount: foldInventoryItemEvents(item.amount, itemEvents),
        details: item.details,
        events: itemEvents,
      };
    });
  }

  async getAllGearItems(): Promise<GearItemRecord[]> {
    const { data } = await this.supabaseClient
      .from('GearItems')
      .select('*')
      .order('name')
      .throwOnError();
    return data.map(mapGearItem);
  }

  async getGearItem(id: GearItemId): Promise<GearItemRecord> {
    const { data } = await this.supabaseClient
      .from('GearItems')
      .select('*')
      .eq('id', id)
      .single()
      .throwOnError();
    return mapGearItem(data);
  }

  async getInventoryItemEvents(
    args: InventoryItemId,
  ): Promise<InventoryItemEvent[]> {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', args.itemType)
      .eq('item_id', args.itemId)
      .throwOnError();
    return data.map((item) => ({
      occurredOn: item.occured_on,
      ...itemEventSchema.parse(item.event),
    }));
  }

  async getAllGearInventoryItemEvents() {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', 'gear')
      .throwOnError();
    return data.map((item) => ({
      gearInventoryId: createGearInventoryId(item.item_id),
      occurredOn: item.occured_on,
      ...itemEventSchema.parse(item.event),
    }));
  }

  private async getInventoryRows() {
    const { data } = await this.supabaseClient
      .from('GearInventory')
      .select('id, gear_item_id, production_date, purchase_date, amount')
      .not('gear_item_id', 'is', null)
      .throwOnError();
    return data.map((item) => ({
      id: createGearInventoryId(item.id),
      gearItemId: createGearItemId(item.gear_item_id),
      productionDate: item.production_date ?? undefined,
      purchaseDate: item.purchase_date ?? undefined,
      amount: item.amount,
    }));
  }
}

const mapGearItem = (item: {
  id: string;
  name: string;
  lifespan: number;
  deposit_fee: number;
}): GearItemRecord => ({
  id: createGearItemId(item.id),
  name: createGearName(item.name),
  lifespan: item.lifespan,
  depositFee: item.deposit_fee,
});
const groupBy = <T, K extends string>(items: T[], key: (item: T) => K) =>
  items.reduce<Partial<Record<K, T[]>>>((groups, item) => {
    const group = groups[key(item)] ?? (groups[key(item)] = []);
    group.push(item);
    return groups;
  }, {});
