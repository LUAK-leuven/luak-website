import type { infer as ZodInfer } from 'zod';
import { entityIdSchema } from '#shared/types/ddd';

declare const userIdBrand: unique symbol;
const userIdSchema = entityIdSchema(userIdBrand);
export type UserId = ZodInfer<typeof userIdSchema>;
export const createUserId = (value: string) => userIdSchema.parse(value);
