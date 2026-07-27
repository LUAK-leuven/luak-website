import { object, literal, number, discriminatedUnion, uuid } from 'zod';
import type { infer as Infer, ZodType } from 'zod';
import type { GearInventoryId, TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

const topoIdSchema = object({
  itemId: uuid() as unknown as ZodType<TopoId>,
  itemType: literal('topo'),
});
const gearIdSchema = object({
  itemId: uuid() as unknown as ZodType<GearInventoryId>,
  itemType: literal('gear'),
});
const inventoryItemIdSchema = discriminatedUnion('itemType', [
  topoIdSchema,
  gearIdSchema,
]);
export type InventoryItemId = Infer<typeof inventoryItemIdSchema>;
export const inventoryItemId = (x: unknown) => inventoryItemIdSchema.parse(x);

export type ItemEventEnvelope = InventoryItemId & {
  occuredOn: string;
  event: ItemEvent;
};

const itemLostEventSchema = object({
  eventName: literal('ItemLostEvent'),
  rentalId: uuid() as unknown as ZodType<RentalId>,
  lostAmount: number().min(1),
});
export const itemLostEvent = (
  rentalId: RentalId,
  lostAmount: number,
): Infer<typeof itemLostEventSchema> => ({
  eventName: 'ItemLostEvent',
  rentalId: rentalId,
  lostAmount: lostAmount,
});

const itemEventSchema = discriminatedUnion('eventName', [itemLostEventSchema]);

export type ItemEvent = Infer<typeof itemEventSchema>;

export const parseEvent = (jsonEvent: unknown): ItemEvent => {
  return itemEventSchema.parse(jsonEvent);
};
