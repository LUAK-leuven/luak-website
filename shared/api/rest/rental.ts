import type { infer as ZodInfer } from 'zod';

declare const rentalIdBrand: unique symbol;
export const rentalIdSchema = entityIdSchema(rentalIdBrand);
export type RentalId = ZodInfer<typeof rentalIdSchema>;
export const createRentalId = (value: string) => rentalIdSchema.parse(value);
