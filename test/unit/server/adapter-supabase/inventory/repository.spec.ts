import { expect, test } from 'vitest';
import { mapGearItem } from '#server/adapter-supabase/inventory/repository';

test('maps a database lifespan of zero to infinite', () => {
  expect(
    mapGearItem({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Carabiner',
      lifespan: 0,
      deposit_fee: 2500,
    }).lifespan,
  ).toBe('infinite');
});
