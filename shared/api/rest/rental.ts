import type { infer as ZodInfer } from 'zod';
import { entityIdSchema } from '#shared/types/ddd';

declare const _rentalIdBrand: unique symbol;
export const rentalIdSchema = entityIdSchema<typeof _rentalIdBrand>();
export type RentalId = ZodInfer<typeof rentalIdSchema>;
export const createRentalId = (value: string) => rentalIdSchema.parse(value);
