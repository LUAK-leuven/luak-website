import type { Database } from '~/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseEvent } from '~/model/gear';
import type { InventoryItemId, ItemEvent } from '~/model/gear';
import type { GearInventoryId, GearItemId } from '~/types/gear';
import { groupBy } from '~/utils/utils';

export class GearDao {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  // --- Gear Inventory ---

  public async getInventorySummary() {
    const inventory = await this._getInventorySummary();
    const events = await this.getAllGearInventoryItemEvents();
    const groupedEvents = groupBy(events, (event) => event.gearInventoryId);

    return inventory.map((item) => {
      const { totalAmount } = this.foldEvents(
        item,
        groupedEvents[item.id] ?? [],
      );
      return {
        gearItemId: item.gearItemId,
        productionDate: item.productionDate,
        purchaseDate: item.purchaseDate,
        totalAmount,
      };
    });
  }

  public async getInventoryDetails(id: GearItemId) {
    const inventory = await this._getInventoryItemDetails(id);
    const events = await this.getAllGearInventoryItemEvents();
    const groupedEvents = groupBy(events, (event) => event.gearInventoryId);

    return inventory.map((item) => {
      const { totalAmount } = this.foldEvents(
        item,
        groupedEvents[item.id] ?? [],
      );
      return {
        id: item.id,
        productionDate: item.productionDate,
        purchaseDate: item.purchaseDate,
        totalAmount,
        details: item.details,
        status: item.status,
        events: groupedEvents[item.id] ?? [],
      };
    });
  }

  private async _getInventorySummary() {
    const { data } = await this.supabaseClient
      .from('GearInventory')
      .select(
        `
          id,
          gear_item_id,
          production_date,
          purchase_date,
          amount
        `,
      )
      .eq('status', 'available')
      .not('gear_item_id', 'is', null)
      .throwOnError();

    return data.map((x) => {
      return {
        id: x.id as GearInventoryId,
        gearItemId: x.gear_item_id as GearItemId,
        productionDate: x.production_date ?? undefined,
        purchaseDate: x.purchase_date ?? undefined,
        amount: x.amount,
      };
    });
  }

  private async _getInventoryItemDetails(id: GearItemId) {
    const { data } = await this.supabaseClient
      .from('GearInventory')
      .select('*')
      .eq('gear_item_id', id)
      .throwOnError();

    return data.map((x) => {
      return {
        id: x.id as GearInventoryId,
        productionDate: x.production_date ?? undefined,
        purchaseDate: x.purchase_date ?? undefined,
        amount: x.amount,
        details: x.details,
        status: x.status,
      };
    });
  }

  public async getAllGearItems() {
    const { data } = await this.supabaseClient
      .from('GearItems')
      .select('*')
      .order('name')
      .throwOnError();

    return data.map((x) => {
      return {
        id: x.id as GearItemId,
        name: x.name,
        lifespan: x.lifespan,
      };
    });
  }

  public async getGearItem(id: GearItemId) {
    const { data } = await this.supabaseClient
      .from('GearItems')
      .select('*')
      .eq('id', id)
      .single()
      .throwOnError();

    return {
      depositFee: data.deposit_fee,
      lifespan: data.lifespan,
      name: data.name,
    };
  }

  private foldEvents(
    invenotryItem: {
      amount: number;
    },
    events: ItemEvent[],
  ) {
    const foldedItem = {
      totalAmount: invenotryItem.amount,
    };
    for (const event of events) {
      switch (event.eventName) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        case 'ItemLostEvent':
          foldedItem.totalAmount -= event.lostAmount;
          break;
      }
    }
    return foldedItem;
  }

  // --- Item Events ---

  public async getInventoryItemEvents(
    args: InventoryItemId,
  ): Promise<(ItemEvent & { ocurredOn: string })[]> {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', args.itemType)
      .eq('item_id', args.itemId)
      .throwOnError();

    return data.map((it) => {
      const parsedEvent = parseEvent(it.event);
      return {
        ocurredOn: it.occured_on,
        ...parsedEvent,
      };
    });
  }

  async getAllGearInventoryItemEvents() {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', 'gear')
      .throwOnError();

    return data.map((it) => {
      const parsedEvent = parseEvent(it.event);
      return {
        gearInventoryId: it.item_id as GearInventoryId,
        occuredOn: it.occured_on,
        ...parsedEvent,
      };
    });
  }
}
