import dayjs from 'dayjs';
import {
  number as zodNumber,
  type infer as ZodInfer,
  iso as zodIso,
} from 'zod';

declare const _dateBrand: unique symbol;
export const dateSchema = zodIso.date().brand<typeof _dateBrand>();
export type Date = ZodInfer<typeof dateSchema>;
export const createDate = (value: string): Date => dateSchema.parse(value);

declare const _dateTimeBrand: unique symbol;
const dateTimeSchema = zodIso.datetime().brand<typeof _dateTimeBrand>();
export type DateTime = ZodInfer<typeof dateTimeSchema>;
export const createDateTime = (value: string): DateTime => {
  return dateTimeSchema.parse(dayjs(value).toISOString());
};

declare const _amountBrand: unique symbol;
export const amountSchema = zodNumber()
  .int()
  .nonnegative()
  .brand<typeof _amountBrand>();
export type Amount = ZodInfer<typeof amountSchema>;
export const amount = (value: number): Amount => amountSchema.parse(value);

declare const _yearBrand: unique symbol;
export const yearSchema = zodNumber()
  .int()
  .positive()
  .max(9999)
  .brand<typeof _yearBrand>();
export type Year = ZodInfer<typeof yearSchema>;
export const year = (value: number): Year => yearSchema.parse(value);
