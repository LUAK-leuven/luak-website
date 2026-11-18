import { type infer as ZodInfer, union as zodUnion } from 'zod';

import {
  type Details,
  type GearInventoryId,
  gearInventoryIdSchema,
  type GearItemId,
  type GearName,
  type LifeSpanInYears,
  type ProductionDate,
  type PurchaseDate,
} from '#shared/api/rest/gear';
import {
  createTotalAmount,
  type InitialAmount,
  type InventoryItemEvent,
  type ItemEvent,
  type TotalAmount,
} from '#shared/api/rest/inventory';
import type { DepositFee } from '#shared/api/rest/rental';
import { topoIdSchema } from '#shared/api/rest/topo';

declare const _inventoryItemIdBrand: unique symbol;
const inventoryItemIdSchema = zodUnion([topoIdSchema, gearInventoryIdSchema]);
export type InventoryItemId = ZodInfer<typeof inventoryItemIdSchema>;
export const createInventoryItemId = (value: string) =>
  inventoryItemIdSchema.parse(value);

export interface InventoryItem {
  id: InventoryItemId;
  amount: TotalAmount;
}

export interface GearInventorySummaryRecord {
  gearItemId: GearItemId;
  productionDate: ProductionDate | undefined;
  purchaseDate: PurchaseDate | undefined;
  lifespan: LifeSpanInYears;
  totalAmount: TotalAmount;
}
export interface GearInventoryRecord extends InventoryItem {
  id: GearInventoryId;
  productionDate: ProductionDate | undefined;
  purchaseDate: PurchaseDate | undefined;
  lifespan: LifeSpanInYears;
  initialAmount: InitialAmount;
  details: Details;
  events: InventoryItemEvent[];
}
export type GearItemRecord = {
  id: GearItemId;
  name: GearName;
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
