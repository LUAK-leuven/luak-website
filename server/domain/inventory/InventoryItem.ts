import type { ItemEvent } from '#server/domain/inventory/ItemEvent';
import {
  totalAmount,
  type TopoId,
  type TotalAmount,
} from '#shared/api/rest/topo';
import type { GearInventoryId, GearItemId } from '#shared/api/rest/gear';
import type { InventoryItemEvent } from '~~/shared/api/rest/inventory';

export type InventoryItemId =
  | {
      itemId: TopoId;
      itemType: 'topo';
    }
  | {
      itemId: GearInventoryId;
      itemType: 'gear';
    };

export type GearInventorySummaryRecord = {
  gearItemId: GearItemId;
  productionDate: string | undefined;
  purchaseDate: string | undefined;
  totalAmount: number;
};
export type GearInventoryRecord = {
  id: GearInventoryId;
  productionDate: string | undefined;
  purchaseDate: string | undefined;
  initialAmount: number;
  totalAmount: number;
  details: string;
  events: InventoryItemEvent[];
};
export type GearItemRecord = {
  id: GearItemId;
  name: string;
  lifespan: number;
  depositFee: number;
};

export const foldInventoryItemEvents = (
  initialAmount: number,
  events: ItemEvent[],
): TotalAmount => {
  return totalAmount(
    events.reduce((acc, event) => {
      switch (event.eventName) {
        case 'ItemLostEvent':
          return acc - event.lostAmount;
        case 'ItemArchivedEvent':
          return acc - event.amount;
      }
    }, initialAmount),
  );
};
