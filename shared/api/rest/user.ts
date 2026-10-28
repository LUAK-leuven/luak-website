import type { infer as ZodInfer } from 'zod';
import { entityIdSchema } from '#shared/types/ddd';

declare const _userIdBrand: unique symbol;
const userIdSchema = entityIdSchema<typeof _userIdBrand>();
export type UserId = ZodInfer<typeof userIdSchema>;
export const createUserId = (value: string) => userIdSchema.parse(value);
