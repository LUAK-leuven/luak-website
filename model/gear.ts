import { object, literal, number, discriminatedUnion } from 'zod';
import type { infer as Infer } from 'zod';

const itemLostEventSchema = object({
  eventName: literal('ItemLostEvent'),
  lostAmount: number().min(1),
});
export const itemLostEvent = (
  lostAmount: number,
): Infer<typeof itemLostEventSchema> => ({
  eventName: 'ItemLostEvent',
  lostAmount: lostAmount,
});

const itemEventSchema = discriminatedUnion('eventName', [itemLostEventSchema]);

export type ItemEvent = Infer<typeof itemEventSchema>;

export const parseEvent = (jsonEvent: unknown): ItemEvent => {
  return itemEventSchema.parse(jsonEvent);
};
