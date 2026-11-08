import type { TopoId } from '#shared/api/rest/topo';
import type {
  GearInventoryId,
  GearItemId,
  GearName,
  Details,
  LifeSpanInYears,
  ProductionDate,
  PurchaseDate,
} from '#shared/api/rest/gear';
import type { DepositFee } from '#shared/api/rest/rental';
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
  productionDate: ProductionDate | undefined;
  purchaseDate: PurchaseDate | undefined;
  totalAmount: TotalAmount;
};
export type GearInventoryRecord = {
  id: GearInventoryId;
  productionDate: ProductionDate | undefined;
  purchaseDate: PurchaseDate | undefined;
  initialAmount: InitialAmount;
  totalAmount: TotalAmount;
  details: Details;
  events: InventoryItemEvent[];
};
export type GearItemRecord = {
  id: GearItemId;
  name: GearName;
  lifespan: LifeSpanInYears;
  depositFee: DepositFee;
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
