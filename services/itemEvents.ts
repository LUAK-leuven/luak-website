import {
  inventoryItemId,
  parseEvent,
  type ItemEventEnvelope,
} from '~/model/gear';
import type { Tables } from '~/types/database.types';
import type { RentalId } from '~/types/rental';

export const inventoryItemEventsFromDB = (
  inventoryItemEvents: Tables<'InventoryItemEvents'>[],
): ItemEventEnvelope[] =>
  inventoryItemEvents.map((event) => {
    const x = inventoryItemId({
      itemId: event.item_id,
      itemType: event.item_type,
    });
    return {
      ...x,
      occuredOn: event.occured_on,
      rentalId: (event.rental_id ?? undefined) as RentalId | undefined,
      event: parseEvent(event.event),
    };
  });
