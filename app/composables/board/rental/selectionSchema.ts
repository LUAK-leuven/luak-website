import * as yup from 'yup';
import { entries } from '#shared/utils/utils';
import type { EntityId } from '#shared/types/ddd';
import type { TotalAmount } from '#shared/api/rest/rental';

export const createRentalSelectionSchema = <T extends EntityId>(
  selection: { id: T; name: string; totalAmount: TotalAmount }[],
) =>
  yup
    .object<Record<T, number | undefined>, Record<T, yup.NumberSchema>>()
    .default(() => ({}))
    .required()
    .test(function (items: Record<string, unknown>) {
      for (const [id, amount] of entries(items)) {
        const item = selection.find((x) => x.id === id);
        if (item === undefined) {
          console.warn(
            `Could not find item ${id} in ${selection.map((x) => x.id).toString()}!`,
          );
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Error: item with id ${id} cannot be found in the inventory.`,
          });
        }
        if (amount === undefined) return true;
        if (typeof amount !== 'number') {
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Value for ${item.name} must be a number, received ${typeof amount}.`,
          });
        }
        if (!Number.isInteger(amount)) {
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Value for ${item.name} must be a whole number.`,
          });
        }
        if (amount <= 0) {
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Value for ${item.name} must be a positive number.`,
          });
        }
        if (amount > item.totalAmount) {
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Value for ${item.name} cannot exceed ${item.totalAmount.toFixed()}`,
          });
        }
      }
      return true;
    });
