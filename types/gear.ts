import type { EntityId } from './ddd';
import type { RentalId } from './rental';

export type GearItemId = EntityId<'gearItem'>;
export type GearInventoryId = EntityId<'gearInventory'>;
export type TopoId = EntityId<'topo'>;

type BaseItemEvent<EventName extends string> = { eventName: EventName };

export type ItemLostEvent = BaseItemEvent<'ItemLostEvent'> & {
  rentalId: RentalId;
  lostAmount: number;
};
export const itemLostEvent = (
  rentalId: RentalId,
  lostAmount: number,
): ItemLostEvent => ({
  eventName: 'ItemLostEvent',
  rentalId,
  lostAmount,
});

export type ItemEvent = ItemLostEvent;
