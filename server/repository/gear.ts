import type { Database } from '~/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseEvent } from '~/model/gear';
import type {
  InventoryItemId,
  ItemEvent,
  ItemEventEnvelope,
} from '~/model/gear';
import type { GearInventoryId, GearItemId } from '~/types/gear';
import { groupBy } from '~/utils/utils';

export class GearDao {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  // --- Gear Inventory ---

  public async getInventorySummary() {
    const inventory = await this._getInventorySummary();
    const events = await this.getAllGearInventoryItemEvents();
    const groupedEvents = groupBy(events, (event) => event.gearInventoryId);

    return inventory.map((item) =>
      this.foldEvents(item, groupedEvents[item.id]),
    );
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

  private foldEvents(
    invenotryItem: {
      id: GearInventoryId;
      gearItemId: GearItemId;
      productionDate: string | undefined;
      purchaseDate: string | undefined;
      amount: number;
    },
    events: ItemEvent[] | undefined,
  ) {
    const foldedItem = {
      id: invenotryItem.id,
      gearItemId: invenotryItem.gearItemId,
      productionDate: invenotryItem.productionDate,
      purchaseDate: invenotryItem.purchaseDate,
      totalAmount: invenotryItem.amount,
    };
    for (const event of events ?? []) {
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

  public async saveInventoryItemEvent(
    args: Omit<ItemEventEnvelope, 'occuredOn'>,
  ) {
    const { error } = await this.supabaseClient
      .from('InventoryItemEvents')
      .insert({
        item_type: args.itemType,
        item_id: args.itemId,
        event: args.event,
        rental_id: args.rentalId,
      });
    if (error) {
      throw new Error('Failed to save changes', { cause: error });
    }
  }

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
        ocurredOn: it.occured_on,
        ...parsedEvent,
      };
    });
  }

  async getLostAmounts(): Promise<Record<GearInventoryId, number | undefined>> {
    const data = await this.getAllGearInventoryItemEvents();

    return data.reduce<Record<GearInventoryId, number | undefined>>(
      (lostAmounts, event) => {
        const lostAmount = lostAmounts[event.gearInventoryId] ?? 0;
        return {
          ...lostAmounts,
          [event.gearInventoryId]: lostAmount + event.lostAmount,
        };
      },
      {},
    );
  }
}
