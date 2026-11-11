import {
  discriminatedUnion,
  type infer as ZodInfer,
  literal,
  number as zodNumber,
  object as zodObject,
} from 'zod';

import { type RentalId, rentalIdSchema } from '#shared/api/rest/rental';
import {
  amountSchema,
  createDateTime,
  dateTimeSchema,
} from '#shared/types/common';

declare const _itemLostAmountBrand: unique symbol;
const itemLostAmountSchema = zodNumber()
  .int()
  .min(1)
  .brand<typeof _itemLostAmountBrand>();
export type ItemLostAmount = ZodInfer<typeof itemLostAmountSchema>;
export const createItemLostAmount = (amount: number): ItemLostAmount =>
  itemLostAmountSchema.parse(amount);

const itemLostEventSchema = zodObject({
  eventName: literal('ItemLostEvent'),
  rentalId: rentalIdSchema.optional(),
  lostAmount: itemLostAmountSchema,
});
export type ItemLostEvent = ZodInfer<typeof itemLostEventSchema>;
export const createItemLostEvent = (args: {
  rentalId?: RentalId;
  lostAmount: ItemLostAmount;
}): ZodInfer<typeof itemLostEventSchema> =>
  itemLostEventSchema.parse({
    eventName: 'ItemLostEvent',
    rentalId: args.rentalId,
    lostAmount: args.lostAmount,
  });

declare const _itemArchivedAmountBrand: unique symbol;
const itemArchivedAmountSchema = zodNumber()
  .int()
  .min(1)
  .brand<typeof _itemArchivedAmountBrand>();
export type ItemArchivedAmount = ZodInfer<typeof itemArchivedAmountSchema>;
export const createItemArchivedAmount = (amount: number): ItemArchivedAmount =>
  itemArchivedAmountSchema.parse(amount);

const itemArchivedEventSchema = zodObject({
  eventName: literal('ItemArchivedEvent'),
  amount: itemArchivedAmountSchema,
});
export type ItemArchivedEvent = ZodInfer<typeof itemArchivedEventSchema>;
export const createItemArchivedEvent = (amount: number): ItemArchivedEvent =>
  itemArchivedEventSchema.parse({
    eventName: 'ItemArchivedEvent',
    amount,
  });

export const itemEventSchema = discriminatedUnion('eventName', [
  itemLostEventSchema,
  itemArchivedEventSchema,
]);
export type ItemEvent = ZodInfer<typeof itemEventSchema>;

declare const _occurredOnBrand: unique symbol;
const occurredOnSchema = dateTimeSchema.brand<typeof _occurredOnBrand>();
export type OccurredOn = ZodInfer<typeof occurredOnSchema>;
export const createOccurredOn = (value: string): OccurredOn =>
  occurredOnSchema.parse(createDateTime(value));

export type InventoryItemEvent = ItemEvent & { occurredOn: OccurredOn };

declare const _initialAmountBrand: unique symbol;
const initialAmountSchema = amountSchema.brand<typeof _initialAmountBrand>();
export type InitialAmount = ZodInfer<typeof initialAmountSchema>;
export const createInitialAmount = (n: number): InitialAmount =>
  initialAmountSchema.parse(n);

declare const _totalAmountBrand: unique symbol;
const totalAmountSchema = amountSchema.brand<typeof _totalAmountBrand>();
export type TotalAmount = ZodInfer<typeof totalAmountSchema>;
export const createTotalAmount = (n: number): TotalAmount =>
  totalAmountSchema.parse(n);
