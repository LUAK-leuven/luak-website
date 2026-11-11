import { type infer as ZodInfer, number as zodNumber } from 'zod';

declare const _availableAmountBrand: unique symbol;
const availableAmountSchema = zodNumber()
  .int()
  .brand<typeof _availableAmountBrand>();
export type AvailableAmount = ZodInfer<typeof availableAmountSchema>;
export const createAvailableAmount = (n: number): AvailableAmount =>
  availableAmountSchema.parse(n);
