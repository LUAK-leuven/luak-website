import {
  number as zodNumber,
  type infer as ZodInfer,
  iso as zodIso,
} from 'zod';

export const dateSchema = zodIso.date();
export type Date = ZodInfer<typeof dateSchema>;
export const createDate = (value: string): Date => dateSchema.parse(value);

declare const amountBrand: unique symbol;
export const amountSchema = zodNumber().int().nonnegative().brand(amountBrand);
export type Amount = ZodInfer<typeof amountSchema>;
export const amount = (value: number): Amount => amountSchema.parse(value);

declare const yearBrand: unique symbol;
export const yearSchema = zodNumber()
  .int()
  .positive()
  .max(9999)
  .brand(yearBrand);
export type Year = ZodInfer<typeof yearSchema>;
export const year = (value: number): Year => yearSchema.parse(value);
