import { expect, test } from 'vitest';
import { createGearItemId } from '#shared/api/rest/gear';
import { createRentalSelectionSchema } from '~/composables/board/rental/selectionSchema';

const gearItemId = createGearItemId('00000000-0000-4000-8000-000000000001');
const schema = createRentalSelectionSchema([
  { id: gearItemId, name: 'Carabiner', totalAmount: 10 },
]);

test('accepts a whole-number rental quantity', async () => {
  await expect(schema.validate({ [gearItemId]: 2 })).resolves.toEqual({
    [gearItemId]: 2,
  });
});

test('rejects fractional rental quantities with a clear message', async () => {
  await expect(schema.validate({ [gearItemId]: 1.5 })).rejects.toThrow(
    'Value for Carabiner must be a whole number.',
  );
});
