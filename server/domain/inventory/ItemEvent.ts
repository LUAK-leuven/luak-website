import { object, literal, number, discriminatedUnion, uuid } from 'zod';
import type { infer as Infer, ZodType } from 'zod';
import type { ItemEvent } from '#shared/api/rest/inventory';

export type { ItemEvent } from '#shared/api/rest/inventory';

const itemLostEventSchema = object({
  eventName: literal('ItemLostEvent'),
  rentalId: (uuid() as unknown as ZodType<RentalId>).optional(),
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

const itemArchivedEventSchema = object({
  eventName: literal('ItemArchivedEvent'),
  amount: number().min(1),
});
export const itemArchivedEvent = (
  amount: number,
): Infer<typeof itemArchivedEventSchema> => ({
  eventName: 'ItemArchivedEvent',
  amount,
});

const itemEventSchema = discriminatedUnion('eventName', [
  itemLostEventSchema,
  itemArchivedEventSchema,
]);

type SchemaItemEvent = Infer<typeof itemEventSchema>;
type Assert<T extends true> = T;
type _SchemaOutputIsCompatible = Assert<
  SchemaItemEvent extends ItemEvent ? true : false
>;

export const parseEvent = (jsonEvent: unknown): ItemEvent => {
  return itemEventSchema.parse(jsonEvent);
};
