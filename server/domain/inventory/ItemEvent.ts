import { object, literal, number, discriminatedUnion, uuid } from 'zod';
import type { infer as Infer, ZodType } from 'zod';

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

export type ItemEvent = Infer<typeof itemEventSchema>;

export const parseEvent = (jsonEvent: unknown): ItemEvent => {
  return itemEventSchema.parse(jsonEvent);
};
