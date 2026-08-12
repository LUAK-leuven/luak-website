import type { ItemEvent } from '#server/domain/inventory/ItemEvent';

export type InventoryItemId =
  | {
      itemId: TopoId;
      itemType: 'topo';
    }
  | {
      itemId: GearInventoryId;
      itemType: 'gear';
    };

export const foldInventoryItemEvents = (
  initialAmount: number,
  events: ItemEvent[],
) => {
  return events.reduce((acc, event) => {
    switch (event.eventName) {
      case 'ItemLostEvent':
        return acc - event.lostAmount;
      case 'ItemArchivedEvent':
        return acc - event.amount;
    }
  }, initialAmount);
};
