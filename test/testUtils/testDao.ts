import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

import type { InventoryItemId } from '#server/domain/inventory/InventoryItem';
import type { ItemEvent } from '#shared/api/rest/inventory';
import type { RentalId } from '#shared/api/rest/rental';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import type { TopoId } from '#shared/api/rest/topo';
import type { Database } from '#shared/types/database.types';
import type { UnsavedRental } from '#shared/types/rental';
import { aRandomRentalItemId } from '#test/builders/rental';
import { aRandomTopoId } from '#test/builders/topo';
import { RentalService } from '~/services/rentalService';

export class TestDao {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  readonly cleanInventoryEvents = async () => {
    await this.supabase
      .from('InventoryItemEvents')
      .delete()
      .neq('occured_on', dayjs().toISOString())
      .throwOnError();
  };

  readonly clearRentals = async () => {
    await this.supabase
      .from('Rentals')
      .delete()
      .neq('deposit', -1)
      .throwOnError();
  };

  readonly addRental = async (rental: UnsavedRental): Promise<RentalId> => {
    const result = await new RentalService(this.supabase).saveRental(rental);
    if (result.error) throw new Error(result.error);
    if (!result.id) throw new Error('Failed to create test rental');
    return result.id;
  };

  readonly setRentedItemAmounts = async (args: {
    rentalId: RentalId;
    rentalItemId: RentalItemId;
    returnedAmount: number;
    lostAmount: number;
  }) => {
    await this.supabase
      .from('RentedItems')
      .update({
        returned_amount: args.returnedAmount,
        lost_amount: args.lostAmount,
      })
      .eq('rental_id', args.rentalId)
      .eq('rental_item_id', args.rentalItemId)
      .throwOnError();
  };

  readonly addInventoryItemEvent = async (args: {
    itemId: InventoryItemId;
    event: ItemEvent;
  }) => {
    await this.supabase.from('InventoryItemEvents').insert({
      item_id: args.itemId,
      event: args.event,
    });
  };

  readonly addTopo = async (args: {
    amount: number;
  }): Promise<{ topoId: TopoId; rentalItemId: RentalItemId }> => {
    const rentalItemId = aRandomRentalItemId();
    const topoId = aRandomTopoId();
    await this.supabase
      .from('RentalItems')
      .insert({
        id: rentalItemId,
        name: 'Test topo',
        deposit_fee: 0,
        item_type: 'topo',
      })
      .throwOnError();
    await this.supabase
      .from('Inventory')
      .insert({ id: topoId, rental_item_id: rentalItemId })
      .throwOnError();
    await this.supabase
      .from('Topos')
      .insert({
        id: topoId,
        title: 'Test topo',
        amount: args.amount,
        authors: [],
        countries: [],
        languages: [],
        place_in_library: 'test',
        tags: [],
        types_of_climbing: [],
      })
      .throwOnError();
    return { topoId, rentalItemId };
  };
}
