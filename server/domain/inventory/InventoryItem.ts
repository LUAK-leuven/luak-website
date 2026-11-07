import type { TopoId } from '#shared/api/rest/topo';
import type {
  GearInventoryId,
  GearItemId,
  GearName,
} from '#shared/api/rest/gear';
import {
  createTotalAmount,
  type InitialAmount,
  type InventoryItemEvent,
  type ItemEvent,
  type TotalAmount,
} from '#shared/api/rest/inventory';

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
  initialAmount: InitialAmount;
  totalAmount: number;
  details: string;
  events: InventoryItemEvent[];
};
export type GearItemRecord = {
  id: GearItemId;
  name: GearName;
  lifespan: number;
  depositFee: number;
};

export const foldInventoryItemEvents = (
  initialAmount: InitialAmount,
  events: ItemEvent[],
): TotalAmount => {
  return createTotalAmount(
    events.reduce<number>((acc, event) => {
      switch (event.eventName) {
        case 'ItemLostEvent':
          return acc - event.lostAmount;
        case 'ItemArchivedEvent':
          return acc - event.amount;
      }
    }, initialAmount),
  );
};
