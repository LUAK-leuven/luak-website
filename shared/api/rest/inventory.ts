import { rentalIdSchema, type RentalId } from '#shared/api/rest/rental';
import {
  object as zodObject,
  literal,
  number as zodNumber,
  discriminatedUnion,
  type infer as ZodInfer,
} from 'zod';
import { amountSchema } from '#shared/types/common';

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

export type InventoryItemEvent = ItemEvent & { occurredOn: string };

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

declare const _availableAmountBrand: unique symbol;
const availableAmountSchema = zodNumber()
  .int()
  .brand<typeof _availableAmountBrand>();
export type AvailableAmount = ZodInfer<typeof availableAmountSchema>;
export const createAvailableAmount = (n: number): AvailableAmount =>
  availableAmountSchema.parse(n);
